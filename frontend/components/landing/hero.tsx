"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import {
  FadeIn,
  FloatingElement,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

import hero from "@/public/1.jpeg";
import HeroSection from "@/public/HeroSection.png";

export function Hero() {
  return (
   <section className="relative h-[100vh] overflow-hidden">
      {/* BACKGROUND IMAGE */}
    <div className="absolute inset-0 -z-20">
  {/* Light Theme */}
  <Image
    src={hero}
    alt="Hero background"
    fill
    priority
    className="object-cover dark:hidden"
  />

  {/* Dark Theme */}
  <Image
    src={HeroSection}
    alt="Hero background"
    fill
    priority
    className="hidden object-cover dark:block"
  />
</div>

      {/* DARK OVERLAY */}
    
   <div className="absolute inset-0 -z-10 bg-black/40 dark:bg-black/10" />

      {/* CONTENT */}
      <div className="container relative flex min-h-screen items-center">
        
          <StaggerContainer className="max-w-3xl text-gray-900 dark:text-white">
          {/* Badge */}
          <StaggerItem>
          
            <Badge className="mb-6 w-fit bg-white/70 text-gray-900 backdrop-blur dark:bg-white/10 dark:text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by blockchain verification
            </Badge>
          </StaggerItem>

          {/* Title */}
          <StaggerItem>
           <h1 className="text-5xl font-extrabold leading-[1.05] text-white tracking-tight sm:text-6xl lg:text-7xl ">
  Own Property With
  <br />
 <span className=" dark:text-blue-600 ">
  Complete Trust
</span>
</h1>
          </StaggerItem>

          {/* Description */}
          <StaggerItem>
            
         <p className="mt-6 max-w-xl text-lg text-white">
              Verify ownership, manage properties, authorize agents, and
              transfer real estate assets transparently with blockchain-grade
              security.
            </p>
          </StaggerItem>

          {/* Buttons */}
          <StaggerItem>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="lg" asChild>
                <Link href="/marketplace">
                  Explore Properties <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <WalletConnect size="lg" />
            </div>
          </StaggerItem>

       
        </StaggerContainer>
      </div>

     
    </section>
  );
}