'use client';

import { useEffect, useRef, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get('job') || 'position';

  const containerRef = useRef(null);
  const gifRef = useRef(null);
  const contentRef = useRef(null);

  const [randomGif, setRandomGif] = useState('');

  const gifs = [
    "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWU0enFzbTllN2I1cWJjZ2cwanB0NTAzcTdnaGkxZ3M4aHFzZjd1MyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/11sBLVxNs7v6WA/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWU0enFzbTllN2I1cWJjZ2cwanB0NTAzcTdnaGkxZ3M4aHFzZjd1MyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/220uphPwJMUJoiyhXG/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eGsyNjF2OTlzajA2eTU5am12aDEzOXQzMjN3bmxoNjQ3dnZjZjh2cCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MTclfCr4tVgis/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dm9tYzh3MXV0OTh1amFvdnBoYTh2MXBvaHp4Z2I0anE0Y3Y5b3huZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3ornjXIIShZ2MgyyHu/giphy.gif"
  ];

  useEffect(() => {
    setRandomGif(gifs[Math.floor(Math.random() * gifs.length)]);

    // GIF scale animation
    if (gifRef.current) {
      gsap.from(gifRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.2
      });
    }

    // Content slide in
    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.6
      });
    }

    // Container fade in
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 0.4
      });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-white via-[#FFF8FA] to-white flex items-center justify-center px-4 -mt-20 py-10"
    >
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Celebration GIF */}
        <div className="flex justify-center">
          <div
            ref={gifRef}
            className="w-64 md:w-full  rounded-2xl overflow-hidden shadow-lg"
          >
            {randomGif && (
              <img
                src={randomGif}
                alt="Success celebration"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-black">
              Application Submitted Successfully!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
              Your application for <span className="font-semibold text-[#D81B5D]">{jobTitle}</span> has been received. Good luck!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => router.push('/jobs')}
              size="lg"
              className="bg-[#D81B5D] hover:bg-[#FF0057] text-white h-12 px-8 text-base shadow-sm"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Browse More Jobs
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-8 text-base"
            >
              Go to Homepage
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D81B5D] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
