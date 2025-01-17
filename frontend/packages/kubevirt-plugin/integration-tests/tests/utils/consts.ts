export const DASH = '-';
export const { STORAGE_CLASS = 'rook-ceph-block' } = process.env;

// TIMEOUTS
const SEC = 1000;
export const CLONE_VM_TIMEOUT_SECS = 720 * SEC;
export const CLONED_VM_BOOTUP_TIMEOUT_SECS = 300 * SEC;
export const PAGE_LOAD_TIMEOUT_SECS = 15 * SEC;
export const TEMPLATE_ACTIONS_TIMEOUT_SECS = 90 * SEC;
export const VM_ACTIONS_TIMEOUT_SECS = 250 * SEC;
export const VM_BOOTUP_TIMEOUT_SECS = 230 * SEC;
export const VM_MIGRATION_TIMEOUT_SECS = 260 * SEC;
export const VM_STOP_TIMEOUT_SECS = 20 * SEC;
export const VM_IP_ASSIGNMENT_TIMEOUT_SECS = 180 * SEC;
export const VM_IMPORT_TIMEOUT_SECS = 160 * SEC;
export const WINDOWS_IMPORT_TIMEOUT_SECS = 150 * SEC;
export const VM_CREATE_AND_EDIT_TIMEOUT_SECS = 200 * SEC;

export const POD_CREATION_TIMEOUT_SECS = 40 * SEC;
export const POD_TERMINATION_TIMEOUT_SECS = 30 * SEC;
export const POD_CREATE_DELETE_TIMEOUT_SECS =
  POD_CREATION_TIMEOUT_SECS + POD_TERMINATION_TIMEOUT_SECS;

export const NODE_STOP_MAINTENANCE_TIMEOUT = 40 * SEC;

// Web-UI Exceptions
export const WAIT_TIMEOUT_ERROR = 'Wait Timeout Error.';
export const WIZARD_CREATE_VM_SUCCESS = 'Successfully created virtual machine';
export const WIZARD_CREATE_VM_ERROR = 'Creating VM failed';
export const WIZARD_CREATE_TEMPLATE_ERROR = 'Creating Template failed';

// Framework Exception
export const UNEXPECTED_ACTION_ERROR = 'Received unexpected action.';

// Compute Nodes
export const NODE_MAINTENANCE_STATUS = 'Under maintenance';
export const NODE_STOPPING_MAINTENANCE_STATUS = 'Stopping maintenance';
export const NODE_READY_STATUS = 'Ready';

// Kubevirt related
export const KUBEVIRT_STORAGE_CLASS_DEFAULTS = 'kubevirt-storage-class-defaults';
export const KUBEVIRT_PROJECT_NAME = 'openshift-cnv';
export const COMMON_TEMPLATES_VERSION = 'v0.6.2';
export const COMMON_TEMPLATES_NAMESPACE = 'openshift';
export const COMMON_TEMPLATES_REVISION = '1';

export enum TAB {
  Consoles = 'Consoles',
  Disks = 'Disks',
  Events = 'Events',
  NetworkInterfaces = 'Network Interfaces',
  Overview = 'Overview',
  Yaml = 'YAML',
}

export enum VM_ACTION {
  Cancel = 'Cancel Virtual Machine Migration',
  Clone = 'Clone Virtual Machine',
  Delete = 'Delete Virtual Machine',
  EditAnnotations = 'Edit Annotations',
  EditLabels = 'Edit Labels',
  Migrate = 'Migrate Virtual Machine',
  Restart = 'Restart Virtual Machine',
  Start = 'Start Virtual Machine',
  Stop = 'Stop Virtual Machine',
}

export enum VM_STATUS {
  Error = 'Error',
  Starting = 'Starting',
  Running = 'Running',
  Off = 'Off',
  Pending = 'Pending',
  Importing = 'Importing',
  Migrating = 'Migrating',
}

export enum DISK_SOURCE {
  AttachDisk = 'Attach Disk',
  AttachClonedDisk = 'Attach Cloned Disk',
  Blank = 'Blank',
  Container = 'Container',
  Url = 'URL',
}

export enum NIC_MODEL {
  VirtIO = 'VirtIO',
  e1000 = 'e1000',
  e1000e = 'e1000e',
  net2kPCI = 'net2kPCI',
  pcnet = 'pcnet',
  rtl8139 = 'rtl8139',
}

export enum DISK_INTERFACE {
  VirtIO = 'VirtIO',
  sata = 'sata',
  scsi = 'scsi',
}

export const networkTabCol = {
  name: 0,
  model: 1,
  network: 2,
  type: 3,
  mac: 4,
};
Object.freeze(networkTabCol);

export const diskTabCol = {
  name: 0,
  source: 1,
  size: 2,
  interface: 3,
  storageClass: 4,
};
Object.freeze(diskTabCol);
