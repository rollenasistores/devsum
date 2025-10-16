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

export default async function Page() {
  return (
    <main className="min-h-screen">
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
  )
}
