import React from 'react';
import { ILoader } from './types';
import './Loader.css';

const Loader: React.FC<ILoader> = (loaderProps: ILoader) => {
  const { que, text } = loaderProps;
  return (
    <>
     { que >= 0 && (
      <div className="overlay">
          { !text ? (<div className="info">Your possition in que: { que === 0 ? `you're next` : que + 1 }</div>)
          :  (<div className="info">{ text }</div>)
          }
          <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
      )}
    </>
  )
}

export default Loader;