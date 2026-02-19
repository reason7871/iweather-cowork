import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, CreditCard, Key, Cpu } from "lucide-react"
import { StepFormLayout, BackButton, ContinueButton } from "./primitives"
import type { LlmAuthType, LlmProviderType } from "@iweather/shared/config/llm-connections"
import { useTranslation } from "react-i18next"

/** Provider segment for the segmented control */
export type ProviderSegment = 'anthropic' | 'openai' | 'copilot'

const BetaBadge = ({ text }: { text: string }) => (
  <span className="inline px-1.5 pt-[2px] pb-[3px] text-[10px] font-accent font-bold rounded-[4px] bg-accent text-background ml-1 relative -top-[1px]">
    {text}
  </span>
)

/**
 * API setup method for onboarding.
 * Maps to specific LlmProviderType + LlmAuthType combinations.
 *
 * - 'claude_oauth' → anthropic + oauth
 * - 'anthropic_api_key' → anthropic + api_key
 * - 'chatgpt_oauth' → openai + oauth
 * - 'openai_api_key' → openai + api_key
 * - 'copilot_oauth' → copilot + oauth
 */
export type ApiSetupMethod =
  | 'anthropic_api_key'
  | 'claude_oauth'
  | 'chatgpt_oauth'
  | 'openai_api_key'
  | 'copilot_oauth'

/**
 * Map ApiSetupMethod to the underlying LLM connection types.
 */
export function apiSetupMethodToConnectionTypes(method: ApiSetupMethod): {
  providerType: LlmProviderType;
  authType: LlmAuthType;
} {
  switch (method) {
    case 'claude_oauth':
      return { providerType: 'anthropic', authType: 'oauth' };
    case 'anthropic_api_key':
      return { providerType: 'anthropic', authType: 'api_key' };
    case 'chatgpt_oauth':
      return { providerType: 'openai', authType: 'oauth' };
    case 'openai_api_key':
      return { providerType: 'openai', authType: 'api_key' };
    case 'copilot_oauth':
      return { providerType: 'copilot', authType: 'oauth' };
  }
}

interface ApiSetupOption {
  id: ApiSetupMethod
  nameKey: string
  descriptionKey: string
  icon: React.ReactNode
  providerType: LlmProviderType
}

const API_SETUP_OPTIONS: ApiSetupOption[] = [
  {
    id: 'claude_oauth',
    nameKey: 'claudePro',
    descriptionKey: 'claudeProDescription',
    icon: <CreditCard className="size-4" />,
    providerType: 'anthropic',
  },
  {
    id: 'anthropic_api_key',
    nameKey: 'anthropicApiKey',
    descriptionKey: 'anthropicApiDescription',
    icon: <Key className="size-4" />,
    providerType: 'anthropic',
  },
  {
    id: 'chatgpt_oauth',
    nameKey: 'codexChatGpt',
    descriptionKey: 'codexChatGptDescription',
    icon: <Cpu className="size-4" />,
    providerType: 'openai',
  },
  {
    id: 'openai_api_key',
    nameKey: 'codexOpenAI',
    descriptionKey: 'codexOpenAIDescription',
    icon: <Key className="size-4" />,
    providerType: 'openai',
  },
  {
    id: 'copilot_oauth',
    nameKey: 'copilotGitHub',
    descriptionKey: 'copilotGitHubDescription',
    icon: <Cpu className="size-4" />,
    providerType: 'copilot',
  },
]

interface APISetupStepProps {
  selectedMethod: ApiSetupMethod | null
  onSelect: (method: ApiSetupMethod) => void
  onContinue: () => void
  onBack: () => void
  /** Initial segment to show (defaults to 'anthropic') */
  initialSegment?: ProviderSegment
}

/**
 * Individual option button component
 */
function OptionButton({
  option,
  isSelected,
  onSelect,
  t,
}: {
  option: ApiSetupOption
  isSelected: boolean
  onSelect: (method: ApiSetupMethod) => void
  t: (key: string) => string
}) {
  return (
    <button
      onClick={() => onSelect(option.id)}
      className={cn(
        "flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "hover:bg-foreground/[0.02] shadow-minimal",
        isSelected
          ? "bg-background"
          : "bg-foreground-2"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          isSelected ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {option.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{t(option.nameKey)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(option.descriptionKey)}
        </p>
      </div>

      {/* Check */}
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isSelected
            ? "border-foreground bg-foreground text-background"
            : "border-muted-foreground/20"
        )}
      >
        {isSelected && <Check className="size-3" strokeWidth={3} />}
      </div>
    </button>
  )
}

/**
 * Segmented control for provider selection
 */
function ProviderSegmentedControl({
  activeSegment,
  onSegmentChange,
  t,
}: {
  activeSegment: ProviderSegment
  onSegmentChange: (segment: ProviderSegment) => void
  t: (key: string) => string
}) {
  const segments: ProviderSegment[] = ['anthropic', 'openai', 'copilot']

  const getSegmentLabel = (segment: ProviderSegment) => {
    switch (segment) {
      case 'anthropic': return t('claude')
      case 'openai': return t('codex')
      case 'copilot': return t('copilot')
    }
  }

  return (
    <div className="flex rounded-xl bg-foreground/[0.03] p-1 mb-4">
      {segments.map((segment) => (
        <button
          key={segment}
          onClick={() => onSegmentChange(segment)}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeSegment === segment
              ? "bg-background shadow-minimal text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {getSegmentLabel(segment)}
        </button>
      ))}
    </div>
  )
}

/**
 * Get segment description with i18n support
 */
function getSegmentDescription(segment: ProviderSegment, t: (key: string) => string) {
  const beta = t('beta')
  switch (segment) {
    case 'anthropic':
      return <>{t('claudeDescription')}<br />{t('claudeConfig')}</>
    case 'openai':
      return <>{t('codexDescription')}<BetaBadge text={beta} /><br />{t('codexConfig')}</>
    case 'copilot':
      return <>{t('copilotDescription')}<BetaBadge text={beta} /><br />{t('copilotConfig')}</>
  }
}

/**
 * APISetupStep - Choose how to connect your AI agents
 *
 * Features a segmented control to filter by provider:
 * - Anthropic - Claude Pro/Max or API Key
 * - OpenAI - ChatGPT Plus/Pro or API Key
 * - GitHub Copilot - Copilot subscription
 */
export function APISetupStep({
  selectedMethod,
  onSelect,
  onContinue,
  onBack,
  initialSegment = 'anthropic',
}: APISetupStepProps) {
  const { t } = useTranslation('onboarding')
  const [activeSegment, setActiveSegment] = useState<ProviderSegment>(initialSegment)

  // Filter options based on active segment
  const filteredOptions = API_SETUP_OPTIONS.filter(o => o.providerType === activeSegment)

  // Handle segment change - clear selection if it doesn't belong to new segment
  const handleSegmentChange = (segment: ProviderSegment) => {
    setActiveSegment(segment)
    // If current selection doesn't match the new segment, don't auto-clear
    // (user might want to keep it and switch back)
  }

  return (
    <StepFormLayout
      title={t('setUpAgent')}
      description={<>{t('setUpAgentDescription')}<br />{t('addMoreConnections')}</>}
      actions={
        <>
          <BackButton onClick={onBack} />
          <ContinueButton onClick={onContinue} disabled={!selectedMethod} />
        </>
      }
    >
      {/* Provider segmented control */}
      <ProviderSegmentedControl
        activeSegment={activeSegment}
        onSegmentChange={handleSegmentChange}
        t={t}
      />

      {/* Segment description */}
      <div className="bg-foreground-2 rounded-[8px] p-4 mb-3">
        <p className="text-sm text-muted-foreground text-center">
          {getSegmentDescription(activeSegment, t)}
        </p>
      </div>

      {/* Filtered options for selected provider - min-h keeps size consistent across tabs */}
      <div className="space-y-3 min-h-[180px]">
        {filteredOptions.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={option.id === selectedMethod}
            onSelect={onSelect}
            t={t}
          />
        ))}
      </div>
    </StepFormLayout>
  )
}
