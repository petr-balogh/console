import * as React from 'react';
import * as _ from 'lodash';
import {
  getContainerImageByDisk,
  getURLSourceByDisk,
  getPVCSourceByDisk,
} from '../../selectors/vm/selectors';
import { WINTOOLS_CONTAINER_NAMES } from '../modals/cdrom-vm-modal/constants';
import { VMKind } from '../../types';
import { V1Disk } from '../../types/vm/disk/V1Disk';

import './disk-summary.scss';

export const DiskSummary: React.FC<DiskSummaryProps> = ({ disks, vm }) => (
  <dl className="oc-vm-details__datalist kubevirt-disk-summary">
    {disks.map(({ name }) => {
      const container = getContainerImageByDisk(vm, name);
      const pvc = getPVCSourceByDisk(vm, name);
      const url = getURLSourceByDisk(vm, name);
      const nameKey = `kubevirt-disk-summary-disk-title-${name}`;
      let value = '';

      if (_.includes(WINTOOLS_CONTAINER_NAMES, container)) {
        value = `Windows Tools: ${container}`;
      } else if (container) {
        value = `Container: ${container}`;
      } else if (url) {
        value = `URL: ${url}`;
      } else if (pvc) {
        value = `PVC: ${pvc}`;
      }

      return (
        <>
          <dt id={nameKey} key={nameKey}>
            {name}
          </dt>
          <dd
            id={`${nameKey}-info`}
            key={`${nameKey}-info`}
            className="co-vm-details-cdroms__datalist-dd text-secondary"
          >
            {value}
          </dd>
        </>
      );
    })}
  </dl>
);

type DiskSummaryProps = {
  vm: VMKind;
  disks: V1Disk[];
};
