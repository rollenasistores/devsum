"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesGrid } from "@/components/features-grid"
import { InstallationSection } from "@/components/installation-section"
import { UsageExamples } from "@/components/usage-examples"
import { AIProviders } from "@/components/ai-providers"
import { CommandReference } from "@/components/command-reference"
import { ExamplesGallery } from "@/components/examples-gallery"
import { AnalyticsPreview } from "@/components/analytics-preview"
import { CommunityStats } from "@/components/community-stats"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-effects"
import { Loading } from "@/components/loading"

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      {isLoading && <Loading onComplete={handleLoadingComplete} />}
      <main className={`min-h-screen custom-cursor-page transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <ScrollProgress />
        <Header />
        <HeroSection />
        <FeaturesGrid />
        <InstallationSection />
        <UsageExamples />
        <AIProviders />
        <CommandReference />
        <ExamplesGallery />
        <AnalyticsPreview />
        <CommunityStats />
        <Footer />
      </main>
    </>
  )
}
