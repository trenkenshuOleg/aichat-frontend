import { Dispatch, SetStateAction } from 'react';
import { ILogMessage } from './types';
import { ILoader } from '../components/Loader/types';

class States {
  public sChatWindow: Dispatch<SetStateAction<ILogMessage[]>>;
  public sCursor: Dispatch<SetStateAction<boolean>>;
  public sLoader: Dispatch<SetStateAction<ILoader>>;
  public sUserInput: Dispatch<SetStateAction<string>>;
  public sInterfaceBlocked: Dispatch<SetStateAction<boolean>>;

  public constructor(setChatWindow: Dispatch<SetStateAction<ILogMessage[]>>,
    setCursor: Dispatch<SetStateAction<boolean>>,
    setLoader: Dispatch<SetStateAction<ILoader>>,
    setUserInput: Dispatch<SetStateAction<string>>,
    setInterfaceBlocked: Dispatch<SetStateAction<boolean>>) {

    this.sChatWindow = setChatWindow;
    this.sCursor = setCursor;
    this.sLoader = setLoader;
    this.sUserInput = setUserInput;
    this.sInterfaceBlocked = setInterfaceBlocked;
  }
}

export default States;