/* eslint-disable lines-between-class-members */

import { ValueEnum, VolumeType } from '../../../constants';
import { DataVolumeSourceType } from '../../../constants/vm/storage';
import { getStringEnumValues } from '../../../utils/types';
import { BinaryUnit } from '../../form/size-unit-utils';

export class StorageUISource extends ValueEnum<string> {
  static readonly BLANK = new StorageUISource(
    'Blank',
    VolumeType.DATA_VOLUME,
    DataVolumeSourceType.BLANK,
  );
  static readonly URL = new StorageUISource(
    'URL',
    VolumeType.DATA_VOLUME,
    DataVolumeSourceType.HTTP,
  );
  static readonly CONTAINER = new StorageUISource('Container', VolumeType.CONTAINER_DISK);
  static readonly ATTACH_CLONED_DISK = new StorageUISource(
    'Attach Cloned Disk',
    VolumeType.DATA_VOLUME,
    DataVolumeSourceType.PVC,
  );
  static readonly ATTACH_DISK = new StorageUISource(
    'Attach Disk',
    VolumeType.PERSISTENT_VOLUME_CLAIM,
    undefined,
  );
  static readonly IMPORT_DISK = new StorageUISource(
    'Import Disk',
    VolumeType.PERSISTENT_VOLUME_CLAIM,
    undefined,
    true,
  );

  static readonly OTHER = new StorageUISource('Other');

  private readonly volumeType: VolumeType;
  private readonly dataVolumeSourceType: DataVolumeSourceType;
  private readonly hasPVC: boolean;

  private static readonly ALL = Object.freeze(
    ValueEnum.getAllClassEnumProperties<StorageUISource>(StorageUISource),
  );

  private static readonly stringMapper = StorageUISource.ALL.reduce(
    (accumulator, volumeType: StorageUISource) => ({
      ...accumulator,
      [volumeType.value]: volumeType,
    }),
    {},
  );

  protected constructor(
    value: string,
    volumeType?: VolumeType,
    dataVolumeSourceType?: DataVolumeSourceType,
    hasPVC: boolean = false,
  ) {
    super(value);
    this.volumeType = volumeType;
    this.dataVolumeSourceType = dataVolumeSourceType;
    this.hasPVC = hasPVC;
  }

  static getAll = () => StorageUISource.ALL;

  static fromSerialized = (volumeType: { value: string }): StorageUISource =>
    StorageUISource.fromString(volumeType && volumeType.value);

  static fromString = (model: string): StorageUISource => StorageUISource.stringMapper[model];

  static fromTypes = (
    volumeType: VolumeType,
    dataVolumeSourceType?: DataVolumeSourceType,
    hasPVC: boolean = false,
  ) =>
    StorageUISource.ALL.find(
      (storageUIType) =>
        storageUIType !== StorageUISource.OTHER &&
        storageUIType.volumeType == volumeType && // eslint-disable-line eqeqeq
        storageUIType.dataVolumeSourceType == dataVolumeSourceType && // eslint-disable-line eqeqeq
        storageUIType.hasPVC == hasPVC, // eslint-disable-line eqeqeq
    );

  getVolumeType = () => this.volumeType;

  getDataVolumeSourceType = () => this.dataVolumeSourceType;

  getAllowedUnits = () =>
    this === StorageUISource.IMPORT_DISK
      ? getStringEnumValues<BinaryUnit>(BinaryUnit)
      : [BinaryUnit.Mi, BinaryUnit.Gi, BinaryUnit.Ti];

  requiresPVC = () =>
    this === StorageUISource.ATTACH_DISK || this === StorageUISource.ATTACH_CLONED_DISK;

  requiresNewPVC = () => this.hasPVC;

  requiresContainerImage = () => this === StorageUISource.CONTAINER;

  requiresURL = () => this === StorageUISource.URL;

  requiresSize = () => this.requiresDatavolume() || this.hasPVC;

  requiresStorageClass = () => this.requiresDatavolume() || this.hasPVC;

  requiresVolume = () => !!this.volumeType;

  requiresDatavolume = () => !!this.dataVolumeSourceType;

  requiresNamespace = () => this === StorageUISource.ATTACH_CLONED_DISK;

  isEditingSupported = () => !this.dataVolumeSourceType; // vm disks - do not support because pvc was already created from DV

  isSizeEditingSupported = () => this !== StorageUISource.IMPORT_DISK;

  hasDynamicSize = () => this === StorageUISource.CONTAINER;

  canBeChangedToThisSource = () =>
    this !== StorageUISource.IMPORT_DISK && this !== StorageUISource.OTHER;
}
