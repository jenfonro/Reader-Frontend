import { hydratePersistentStorage } from "./persistentStorage";
import { userDataStorageKeys } from "./userStorageKeys";
import { syncUiPreferencesToDocument } from "./uiPreferences";

export const hydrateUserStorage = async () => {
  await hydratePersistentStorage(userDataStorageKeys);
  syncUiPreferencesToDocument();
};
