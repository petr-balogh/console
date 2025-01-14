import { execSync } from 'child_process';
import * as _ from 'lodash';
import { browser, ExpectedConditions as until } from 'protractor';
import { click } from '@console/shared/src/test-utils/utils';
import { isNodeReady } from '@console/shared/src/selectors/node';
import { PodKind } from '@console/internal/module/k8s';
import { getName } from '@console/shared/src/selectors/common';
import {
  confirmButton,
  clickKebabAction,
  goToInstalledOperators,
  ocsOp,
  storageClusterRow,
  storageClusterView,
  verifyFields,
} from '../views/add-capacity.view';
import { CLUSTER_STATUS, EXPAND_WAIT, KIND, NS, POD_NAME_PATTERNS, SECOND } from '../utils/consts';
import {
  getOSDPreparePodsCnt,
  getPodName,
  getPodPhase,
  getPodRestartCount,
  isPodPresent,
  testPodIsRunning,
  testPodIsSucceeded,
} from '../utils/helpers';

const storageCluster = JSON.parse(execSync(`kubectl get -o json -n ${NS} ${KIND}`).toString());
const cephValue = JSON.parse(execSync(`kubectl get cephCluster -n ${NS} -o json`).toString());
const clusterStatus = storageCluster.items[0];
const cephHealth = cephValue.items[0];

const expansionObjects = {
  clusterJSON: {},
  previousCnt: 0,
  updatedCnt: 0,
  updatedClusterJSON: {},
  previousPods: { items: [] as PodKind[] },
  updatedPods: { items: [] as PodKind[] },
};

describe('Check availability of ocs cluster', () => {
  if (clusterStatus) {
    it('Should check if the ocs cluster is Ready for expansion', () => {
      expect(_.get(clusterStatus, 'status.phase')).toBe(CLUSTER_STATUS.READY);
    });
  } else {
    it('Should state that ocs cluster is not ready for expansion', () => {
      expect(clusterStatus).toBeUndefined();
    });
  }
});

describe('Check availability of Ceph cluster', () => {
  if (cephHealth) {
    it('Check if the Ceph cluster is healthy before expansion', () => {
      expect(cephHealth.status.ceph.health).not.toBe(CLUSTER_STATUS.HEALTH_ERROR);
    });
  } else {
    it('Should state that Ceph cluster doesnt exist', () => {
      expect(cephHealth).toBeUndefined();
    });
  }
});

if (clusterStatus && cephHealth) {
  describe('Check add capacity functionality for ocs service', () => {
    beforeAll(async () => {
      [expansionObjects.clusterJSON] = storageCluster.items;
      const name = getName(expansionObjects.clusterJSON);
      expansionObjects.previousCnt = _.get(
        expansionObjects.clusterJSON,
        'spec.storageDeviceSets[0].count',
      );
      const uid = _.get(expansionObjects.clusterJSON, 'metadata.uid').toString();
      expansionObjects.previousPods = JSON.parse(
        execSync(`kubectl get pods -n ${NS} -o json`).toString(),
      );

      await goToInstalledOperators();
      await click(ocsOp);
      await click(storageClusterView);

      await clickKebabAction(uid, 'Add Capacity');
      await verifyFields();
      await click(confirmButton);

      const statusCol = storageClusterRow(uid).$('td:nth-child(4)');

      // need to wait as cluster states fluctuates for some time. Waiting for 2 secs for the same
      await browser.sleep(2 * SECOND);

      await browser.wait(until.textToBePresentInElement(statusCol, CLUSTER_STATUS.PROGRESSING));
      await browser.wait(
        until.textToBePresentInElement(
          statusCol.$('span.co-icon-and-text span'),
          CLUSTER_STATUS.READY,
        ),
      );

      expansionObjects.updatedClusterJSON = JSON.parse(
        execSync(`kubectl get -o json -n ${NS} ${KIND} ${name}`).toString(),
      );
      expansionObjects.updatedCnt = _.get(
        expansionObjects.updatedClusterJSON,
        'spec.storageDeviceSets[0].count',
      );
      expansionObjects.updatedPods = JSON.parse(
        execSync(`kubectl get pod -o json -n ${NS}`).toString(),
      );
    }, EXPAND_WAIT);

    it('Newly added capacity should takes into effect at the storage level', () => {
      // by default 2Tib capacity is being added
      expect(expansionObjects.updatedCnt - expansionObjects.previousCnt).toEqual(1);
    });

    it('New osd pods corresponding to the additional capacity should be in running state', () => {
      const newOSDPods = [] as PodKind[];
      const newOSDPreparePods = [] as PodKind[];
      expansionObjects.updatedPods.items.forEach((pod) => {
        const podName = getPodName(pod);
        if (!isPodPresent(expansionObjects.previousPods, podName)) {
          if (podName.includes(POD_NAME_PATTERNS.ROOK_CEPH_OSD_PREPARE)) {
            newOSDPreparePods.push(pod);
          } else if (podName.includes(POD_NAME_PATTERNS.ROOK_CEPH_OSD)) {
            newOSDPods.push(pod);
          }
        }
      });

      const previousOSDPreparePodsCnt = getOSDPreparePodsCnt(expansionObjects.previousPods);
      expect(newOSDPods.length).toEqual(3);
      /* since rook-ceph-osd-prepare-ocs-deviceset- keeps changing their last 4 characters,
      hence subtracting the count of previous rook-ceph-osd-prepare-ocs-deviceset- pods */
      expect(newOSDPreparePods.length - previousOSDPreparePodsCnt).toEqual(3);

      newOSDPods.forEach((pod) => {
        testPodIsRunning(getPodPhase(pod));
      });

      newOSDPreparePods.forEach((pod) => {
        testPodIsSucceeded(getPodPhase(pod));
      });
    });

    it('No ocs pods should get restarted unexpectedly', () => {
      expansionObjects.previousPods.items.forEach((pod) => {
        const prevRestartCnt = getPodRestartCount(pod);
        const updatedpod = isPodPresent(expansionObjects.updatedPods, getPodName(pod));
        if (updatedpod) {
          const updatedRestartCnt = getPodRestartCount(updatedpod);
          expect(prevRestartCnt).toBe(updatedRestartCnt);
        }
      });
    });

    it('No ocs nodes should go to NotReady state', () => {
      const nodes = JSON.parse(execSync(`kubectl get nodes -o json`).toString());
      const areAllNodes = nodes.items.every((node) => isNodeReady(node));

      expect(areAllNodes).toEqual(true);
    });

    it('Ceph cluster should be healthy after expansion', () => {
      const cephValueAfter = JSON.parse(
        execSync(`kubectl get cephCluster -n ${NS} -o json`).toString(),
      );
      const cephHealthAfter = cephValueAfter.items[0];
      expect(cephHealthAfter.status.ceph.health).not.toBe(CLUSTER_STATUS.HEALTH_ERROR);
    });
  });
}
