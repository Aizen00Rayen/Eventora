import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-32 -mx-6 -mt-6 mb-4" />
      <div className="skeleton h-5 w-3/4 mb-2" />
      <div className="skeleton h-4 w-full mb-1" />
      <div className="skeleton h-4 w-2/3 mb-4" />
      <div className="skeleton h-4 w-1/2 mb-1" />
      <div className="skeleton h-4 w-1/3 mb-4" />
      <div className="flex justify-between">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-8 w-16 rounded-pill" />
      </div>
    </div>
  );
}
