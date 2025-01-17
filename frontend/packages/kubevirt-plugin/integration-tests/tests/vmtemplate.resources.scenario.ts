import {
  createResource,
  deleteResource,
  deleteResources,
} from '@console/shared/src/test-utils/utils';
import { get } from 'lodash';
import { testName } from '@console/internal-integration-tests/protractor.conf';
import { TEMPLATE_ACTIONS_TIMEOUT_SECS } from './utils/consts';
import { basicVMConfig, multusNAD, hddDisk, networkInterface, rootDisk } from './utils/mocks';
import { getProvisionConfigs } from './vm.wizard.configs';
import { VirtualMachine } from './models/virtualMachine';
import { VirtualMachineTemplate } from './models/virtualMachineTemplate';
import { ProvisionConfig } from './utils/types';
import { getResourceObject } from './utils/utils';
import { ProvisionConfigName } from './utils/constants/wizard';

describe('Test adding/removing discs/nics to/from a VM template', () => {
  const provisionConfigContainer = getProvisionConfigs().get(ProvisionConfigName.CONTAINER);
  const commonSettings = {
    cloudInit: {
      useCloudInit: false,
    },
    namespace: testName,
    description: `Default description ${testName}`,
    flavor: basicVMConfig.flavor,
    operatingSystem: basicVMConfig.operatingSystem,
    workloadProfile: basicVMConfig.workloadProfile,
  };
  const vmTemplateConfig = (name: string, provisionConfig: ProvisionConfig) => {
    return {
      ...commonSettings,
      name,
      provisionSource: provisionConfig.provision,
      storageResources: [],
      networkResources: [],
    };
  };
  const vmConfig = (name: string, templateConfig) => {
    return {
      ...commonSettings,
      startOnCreation: true,
      name,
      template: templateConfig.name,
      provisionSource: templateConfig.provisionSource,
      storageResources: [],
      networkResources: [],
    };
  };

  const templateCfg = vmTemplateConfig(
    `tmpl-${provisionConfigContainer.provision.method.toLowerCase()}`,
    provisionConfigContainer,
  );
  const vmTemplate = new VirtualMachineTemplate(templateCfg);

  const vmCfg = vmConfig(`vmfromtmpl-${vmTemplate.name}`, templateCfg);
  const vm = new VirtualMachine(vmCfg);

  beforeAll(async () => {
    createResource(multusNAD);
    await vmTemplate.create(templateCfg);
  }, TEMPLATE_ACTIONS_TIMEOUT_SECS);

  afterAll(() => {
    deleteResources([multusNAD, vmTemplate.asResource()]);
  });

  describe('Test adding discs/nics to a VM template', () => {
    vmCfg.startOnCreation = false;

    beforeAll(async () => {
      await vmTemplate.addDisk(hddDisk);
      await vmTemplate.addNIC(networkInterface);
      await vm.create(vmCfg);
    }, TEMPLATE_ACTIONS_TIMEOUT_SECS);

    afterAll(() => {
      deleteResource(vm.asResource());
    });

    it('Adds a disk to a VM template', async () => {
      expect(vm.getAttachedDisks()).toContain(hddDisk);
    });

    it('Adds a NIC to a VM template', async () => {
      expect(vm.getAttachedNICs()).toContain(networkInterface);
    });

    xit('BZ(1779116) Clones disk defined in VM template', async () => {
      const dataVolumeName = `${vm.name}-${vmTemplate.name}-${rootDisk.name}-clone`;
      const dataVolume = getResourceObject(dataVolumeName, vm.namespace, 'datavolume');
      const srcPvc = get(dataVolume, 'spec.source.pvc.name', '');
      expect(srcPvc).toEqual(`${vmTemplate.name}-${rootDisk.name}`);
    });
  });

  describe('Test removing discs/nics from a VM template', () => {
    beforeAll(async () => {
      await vmTemplate.removeDisk(hddDisk.name);
      await vmTemplate.removeNIC(networkInterface.name);
      await vm.create(vmCfg);
    }, TEMPLATE_ACTIONS_TIMEOUT_SECS);

    afterAll(() => {
      deleteResource(vm.asResource());
    });

    it('Removes a disk from VM template', async () => {
      expect(vm.getAttachedDisks()).not.toContain(hddDisk);
    });

    it('Removes a NIC from VM template', async () => {
      expect(vm.getAttachedNICs()).not.toContain(networkInterface);
    });
  });
});
