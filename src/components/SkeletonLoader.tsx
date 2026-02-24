import React from 'react';

export const SkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-12">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="flex gap-4">
                    <div className="h-16 w-40 bg-gray-200 rounded-2xl"></div>
                    <div className="h-16 w-40 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-8 space-y-6 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
                            <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-6 w-3/4 bg-gray-100 rounded-lg"></div>
                            <div className="h-4 w-1/2 bg-gray-100 rounded-lg"></div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <div className="flex justify-between">
                                <div className="h-3 w-16 bg-gray-50 rounded"></div>
                                <div className="h-3 w-8 bg-gray-50 rounded"></div>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
