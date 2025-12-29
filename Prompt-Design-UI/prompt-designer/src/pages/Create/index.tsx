import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGenerateStore } from "@/store/generateStore"
import { Step1Input, Step2Analysis, Step3Adjust, Step4Result } from "@/components/wizard"
import { Check } from "lucide-react"

const steps = [
  { id: 1, title: "角色描述输入", icon: "📝" },
  { id: 2, title: "AI 分析与方案生成", icon: "🤖" },
  { id: 3, title: "模板定制", icon: "⚙️" },
  { id: 4, title: "预览与导出", icon: "✨" },
]

export function Create() {
  const { session } = useGenerateStore()
  const currentStep = session.currentStep

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Input />
      case 2:
        return <Step2Analysis />
      case 3:
        return <Step3Adjust />
      case 4:
        return <Step4Result />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep > step.id
                    ? "bg-green-600 border-green-600"
                    : currentStep === step.id
                    ? "bg-purple-600 border-purple-600"
                    : "border-slate-600 text-slate-500"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {step.id}
                  </span>
                )}
              </div>
              <span className="mt-2 text-xs text-slate-400 text-center max-w-[100px]">
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-24 h-0.5 mx-2 ${
                  currentStep > step.id ? "bg-green-600" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-600/20">
              <span className="text-2xl">{steps[currentStep - 1].icon}</span>
            </div>
            <CardTitle className="text-xl text-white">
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  )
}
