import React from 'react';
import { ILoader } from './types';
import './Loader.css';

const Loader: React.FC<ILoader> = (loaderProps: ILoader) => {
  const { que, text } = loaderProps;
  return (
    <>
      <div className={que >= 0 ? "overlay" : "overlay hidden"}>
          <div className="info">
            {
            !text ? (<span>Your possition in que: { que === 0 ? `you're next` : que + 1 }</span>)
            : (<span>{text}</span>)
            }
            </div>

          <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
    </>
  )
}

export default Loader;