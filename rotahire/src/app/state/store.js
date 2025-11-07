import { atom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const userDeetsAtom = atomWithStorage('userDeets', null);
export const loadingAtom = atom(false);
export const sportsDataAtom = atom([]);

// Portal authentication atoms
export const portalUserAtom = atomWithStorage('portalUser', null);
export const portalLoadingAtom = atom(false);





export function useResetAllAtoms() {
  const setUserDeets = useSetAtom(userDeetsAtom);
  const setSportsData = useSetAtom(sportsDataAtom);
  const setPortalUser = useSetAtom(portalUserAtom);


  return () => {
    setUserDeets(null);
    setSportsData([]);
    setPortalUser(null);

  };
}