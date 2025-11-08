import { atom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const userDeetsAtom = atomWithStorage('userDeets', null);
export const loadingAtom = atom(false);
export const sportsDataAtom = atom([]);

// Portal authentication atoms
export const portalUserAtom = atomWithStorage('portalUser', null);
export const portalLoadingAtom = atom(false);

// Admin authentication atoms
export const adminUserAtom = atomWithStorage('adminUser', null);
export const adminLoadingAtom = atom(false);





export function useResetAllAtoms() {
  const setUserDeets = useSetAtom(userDeetsAtom);
  const setSportsData = useSetAtom(sportsDataAtom);
  const setPortalUser = useSetAtom(portalUserAtom);
  const setAdminUser = useSetAtom(adminUserAtom);

  return () => {
    setUserDeets(null);
    setSportsData([]);
    setPortalUser(null);
    setAdminUser(null);
  };
}