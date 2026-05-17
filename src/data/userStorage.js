import { hydratePersistentStorage } from "./persistentStorage";
import { userDataStorageKeys } from "./userStorageKeys";

export const hydrateUserStorage = () => hydratePersistentStorage(userDataStorageKeys);
