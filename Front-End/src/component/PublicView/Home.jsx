import React from 'react';
import { SyncLoader } from 'react-spinners';

const Home = () => {
  return (
    <div className="container mx-auto mt-8 flex h-[80vh] max-w-7xl flex-grow flex-col items-center justify-center rounded-lg bg-white p-8 shadow-xl">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">
          Undermaintenance
        </h1>
        <p className="mb-6 text-xl text-gray-600">
          Pansamantalang hindi available ang site. Nag-u-update kami para mapabuti ang serbisyo.
        </p>
        <div className="mt-8 flex justify-center">
          <SyncLoader color={'#3B82F6'} loading={true} size={15} />
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Salamat sa iyong pasensya.
        </p>
      </div>
    </div>
  );
};

export default Home;