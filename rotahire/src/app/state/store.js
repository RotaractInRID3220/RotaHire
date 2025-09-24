import { atom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const userDeetsAtom = atomWithStorage('userDeets', null);
export const loadingAtom = atom(false);





export function useResetAllAtoms() {
  const setUserDeets = useSetAtom(userDeetsAtom);
  const setSportsData = useSetAtom(sportsDataAtom);


  return () => {
    setUserDeets(null);
    setSportsData([]);

  };
}