import { Header } from "@/components/header"
import { DocsLayout } from "@/components/docs-layout"
import { GettingStarted } from "@/components/docs/getting-started"
import { Installation } from "@/components/docs/installation"
import { Configuration } from "@/components/docs/configuration"
import { CommandsReference } from "@/components/docs/commands-reference"
import { AIProvidersSetup } from "@/components/docs/ai-providers-setup"
import { OutputFormats } from "@/components/docs/output-formats"
import { UseCases } from "@/components/docs/use-cases"
import { Troubleshooting } from "@/components/docs/troubleshooting"

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <DocsLayout>
        <div className="space-y-16">
          <GettingStarted />
          <Installation />
          <Configuration />
          <CommandsReference />
          <AIProvidersSetup />
          <OutputFormats />
          <UseCases />
          <Troubleshooting />
        </div>
      </DocsLayout>
    </div>
  )
}
