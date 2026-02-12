import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-800';
  
  const variantClasses = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#1A1B1D] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 h-full flex flex-col">
    <div className="flex items-start justify-between mb-6">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="rounded" width={80} height={24} />
    </div>
    <Skeleton variant="text" className="mb-4 w-3/4 h-6" />
    <Skeleton variant="text" className="mb-2 w-full" />
    <Skeleton variant="text" className="mb-6 w-2/3" />
    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
      <Skeleton variant="text" width={60} />
      <Skeleton variant="rounded" width={100} height={36} />
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="bg-white dark:bg-[#1A1B1D] rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      <Skeleton variant="circular" width={120} height={120} className="shrink-0" />
      <div className="flex-1 w-full space-y-4">
        <Skeleton variant="text" className="h-8 w-1/3" />
        <Skeleton variant="text" className="h-4 w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
              <Skeleton variant="text" className="h-4 w-1/2 mb-2" />
              <Skeleton variant="text" className="h-6 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonLessonRow = () => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#1A1B1D] border border-gray-100 dark:border-gray-800 rounded-xl mb-3">
    <Skeleton variant="circular" width={32} height={32} />
    <div className="flex-1">
      <Skeleton variant="text" className="h-5 w-1/3 mb-2" />
      <Skeleton variant="text" className="h-3 w-1/4" />
    </div>
    <Skeleton variant="rounded" width={80} height={32} />
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white dark:bg-[#1A1B1D] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div>
            <Skeleton variant="text" className="h-4 w-20 mb-2" />
            <Skeleton variant="text" className="h-6 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonPlayer = () => (
  <div className="flex h-screen bg-white dark:bg-[#1A1B1D] overflow-hidden">
    {/* Sidebar Skeleton */}
    <div className="w-80 border-r border-gray-100 dark:border-gray-800 p-6 hidden md:block">
      <Skeleton variant="text" className="h-8 w-2/3 mb-8" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton variant="text" className="h-5 w-1/2 mb-4" />
            <div className="space-y-3 pl-4">
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Content Skeleton */}
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <Skeleton variant="rounded" className="w-full h-64 mb-8" />
        <Skeleton variant="text" className="h-10 w-3/4 mb-6" />
        <div className="space-y-4">
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonExamCard = () => (
  <div className="bg-white dark:bg-[#1A1B1D] rounded-xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6">
    <Skeleton variant="circular" width={64} height={64} className="shrink-0" />
    <div className="flex-1 w-full">
      <Skeleton variant="text" className="h-6 w-1/3 mb-3" />
      <div className="flex gap-4">
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="text" className="h-4 w-24" />
      </div>
    </div>
    <Skeleton variant="rounded" width={120} height={40} />
  </div>
);

export const SkeletonPage = () => (
  <div className="flex h-screen bg-surface dark:bg-background-dark overflow-hidden">
    {/* Sidebar Skeleton */}
    <div className="hidden lg:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 p-4 gap-4">
      <Skeleton variant="rounded" height={40} className="mb-6" />
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} variant="rounded" height={48} />
      ))}
    </div>
    
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
        <Skeleton variant="text" width={200} height={24} />
        <div className="flex gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton variant="rounded" height={200} />
            <Skeleton variant="rounded" height={300} />
          </div>
          <div className="space-y-6">
            <Skeleton variant="rounded" height={150} />
            <Skeleton variant="rounded" height={350} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonCheckout = () => (
  <div className="min-h-screen bg-surface dark:bg-[#1A1B1D] py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto">
      <Skeleton variant="text" width={120} height={24} className="mb-8" />
      <div className="bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-b border-gray-200 dark:border-gray-800">
          <Skeleton variant="text" width={150} height={20} className="mb-2" />
          <Skeleton variant="text" width={250} height={32} />
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Skeleton variant="text" width={120} height={24} className="mb-4" />
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Skeleton variant="rounded" width={48} height={48} />
                <div className="flex-1">
                  <Skeleton variant="text" width={150} height={20} className="mb-2" />
                  <Skeleton variant="text" width={100} height={16} />
                </div>
              </div>
              <div className="flex justify-between items-center py-4 border-t border-gray-100 dark:border-gray-800">
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="text" width={80} height={32} />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton variant="text" width={120} height={24} className="mb-4" />
              <Skeleton variant="rounded" width="100%" height={200} />
              <Skeleton variant="rounded" width="100%" height={48} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonSuccess = () => (
  <div className="flex flex-col items-center">
    <Skeleton variant="circular" width={80} height={80} className="mb-6" />
    <Skeleton variant="text" width={200} height={32} className="mb-2" />
    <Skeleton variant="text" width={280} height={48} className="mb-8" />
    <Skeleton variant="rounded" width="100%" height={56} />
  </div>
);

export const SkeletonExamRunner = () => (
  <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen flex flex-col">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center mb-8">
      <Skeleton variant="text" width={100} height={24} />
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
    
    {/* Question Skeleton */}
    <div className="flex-1">
      <Skeleton variant="text" width="80%" height={32} className="mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
             <Skeleton variant="circular" width={24} height={24} />
             <Skeleton variant="text" width="60%" height={20} />
          </div>
        ))}
      </div>
    </div>
    
    {/* Footer Skeleton */}
    <div className="mt-8 flex justify-between">
      <Skeleton variant="rounded" width={100} height={40} />
      <Skeleton variant="rounded" width={100} height={40} />
    </div>
  </div>
);

export default Skeleton;
