import { CraftAgentsSymbol } from "@/components/icons/CraftAgentsSymbol"
import { StepFormLayout, ContinueButton } from "./primitives"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

interface WelcomeStepProps {
  onContinue: () => void
  /** Called when user skips the setup */
  onSkip?: () => void
  /** Whether this is an existing user updating settings */
  isExistingUser?: boolean
  /** Whether the app is loading (e.g., checking Git Bash on Windows) */
  isLoading?: boolean
}

/**
 * WelcomeStep - Initial welcome screen for onboarding
 *
 * Shows different messaging for new vs existing users:
 * - New users: Welcome to iWeather
 * - Existing users: Update your API connection settings
 */
export function WelcomeStep({
  onContinue,
  onSkip,
  isExistingUser = false,
  isLoading = false
}: WelcomeStepProps) {
  const { t } = useTranslation('onboarding')

  return (
    <StepFormLayout
      iconElement={
        <div className="flex size-16 items-center justify-center">
          <CraftAgentsSymbol className="size-10 text-accent" />
        </div>
      }
      title={isExistingUser ? t('updateSettings') : t('welcome')}
      description={
        isExistingUser
          ? t('updateSettingsDescription')
          : t('welcomeDescription')
      }
      actions={
        <div className="flex flex-col gap-3 w-full">
          <ContinueButton onClick={onContinue} className="w-full" loading={isLoading} loadingText={t('checking')}>
            {isExistingUser ? t('continue') : t('getStarted')}
          </ContinueButton>
          {!isExistingUser && onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {t('skip')}
            </Button>
          )}
        </div>
      }
    />
  )
}
