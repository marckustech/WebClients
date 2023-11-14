/**
 * Feature flag list from Unleash
 * Format should be FeatureFlagName = 'FeatureFlagName'
 */
enum MailFeatureFlag {
    AttachmentThumbnails = 'AttachmentThumbnails',
    WebMailPageSizeSetting = 'WebMailPageSizeSetting',
    EmailForwarding = 'EmailForwarding',
}
enum CommonFeatureFlag {
    DisableElectronMail = 'DisableElectronMail',
}

enum AccountFlag {
    MaintenanceImporter = 'MaintenanceImporter',
    SignedInAccountRecovery = 'SignedInAccountRecovery',
    PassVaultSharingDescription = 'PassVaultSharingDescription',
}

enum DriveFeatureFlag {
    DrivePhotos = 'DrivePhotos',
    DrivePhotosUploadDisabled = 'DrivePhotosUploadDisabled',
}

export type FeatureFlag = `${MailFeatureFlag}` | `${AccountFlag}` | `${DriveFeatureFlag}` | `${CommonFeatureFlag}`;
