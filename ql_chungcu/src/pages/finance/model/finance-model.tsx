import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import ModelSelection from "./model-selection.tsx";
import BuildingConfig from "./building-config.tsx";
import ModelDashboard from "./model-dashboard.tsx";
import { AuthContext } from "@/context/AuthContext.tsx";
import { findComplexByIdAPI } from "@/apis/complexAPI.ts";
import { getAllBdAPI, updateRatioAPI } from "@/apis/bdAPI.ts";
import type { bdItemCheckbox } from "@/types/Building.ts";
import { createFinanceModelAPI } from "@/apis/financialModelAPI.ts";

type ModelType = "centralized" | "decentralized" | null;
type WizardStep = "selection" | "configuration" | "dashboard";

interface BuildingRatio {
  id: string;
  ratio: number;
}

export default function FinanceModel() {
  // Wizard state management
  const [currentStep, setCurrentStep] = useState<WizardStep>();
  const [selectedModelType, setSelectedModelType] = useState<ModelType>(null);
  const [configuredBuildings, setConfiguredBuildings] = useState<
    BuildingRatio[]
  >([]);
  const [isSystemInitialized, setIsSystemInitialized] = useState(false);
  const [buildings, setBuildings] = useState([]);

  const { complex,setFinanceModel } = useContext(AuthContext);

  // Check if system is already initialized
  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      const data = await findComplexByIdAPI(complex);
      const finance_model = data.financialModel;
      if (finance_model) {
        setIsSystemInitialized(true);
        setSelectedModelType(finance_model);
        setConfiguredBuildings(finance_model.buildings || []);
        setCurrentStep("dashboard");
      } else {
        setCurrentStep("selection");
      }
    } catch (error) {
      toast.error("Error checking initialization:" + error);
    }
  };

  const getAllBuilding = async () => {
    try {
      const data = await getAllBdAPI();

      const items = data.map(function (item: bdItemCheckbox) {
        return {
          value: item.id,
          label: item.buildingName,
        };
      });
      console.log(items);
      setBuildings(items);
    } catch (err) {
      // Error đã được xử lý bởi interceptor
    }
  };

  // Handle model selection
  const handleModelSelection = (modelType: ModelType) => {
    setSelectedModelType(modelType);

    if (modelType === "centralized") {
      // For centralized model, skip building configuration
      handleFinishConfiguration(modelType, []);
    } else {
      // For distributed model, go to building configuration
      getAllBuilding();
      setCurrentStep("configuration");
    }
  };

  // Handle building configuration completion
  const handleBuildingConfiguration = (buildings: BuildingRatio[]) => {
    setConfiguredBuildings(buildings);
    handleFinishConfiguration(selectedModelType, buildings);
  };

  // Save configuration and finish setup
  const handleFinishConfiguration = async (
    modelType: ModelType,
    buildings: BuildingRatio[],
  ) => {
    try {
      const config = {
        type: modelType,
        ratio: modelType === "decentralized" ? buildings : [],
      };

      // TODO: Save to backend API
      await createFinanceModelAPI(config);
      setFinanceModel(modelType);
      toast.success("Cấu hình mô hình tài chính thành công!");
      setIsSystemInitialized(true);
      setCurrentStep("dashboard");
    } catch (error) {
      toast.error("Không thể lưu cấu hình. Vui lòng thử lại. " + error);
    }
  };

  // Handle back from configuration
  const handleBackFromConfiguration = () => {
    setCurrentStep("selection");
  };

  // Handle update ratio (called from dashboard inline edit)
  const handleUpdateRatio = async (buildings: BuildingRatio[]) => {
    try {
      await updateRatioAPI({ ratio: buildings });

      setConfiguredBuildings(buildings);
      toast.success("Cập nhật tỉ lệ phân bổ thành công!");
      // Refresh lại dữ liệu
      checkInitialization();
    } catch (error) {
      toast.error("Không thể cập nhật tỉ lệ. Vui lòng thử lại.");
    }
  };

  // Render wizard steps
  if (!isSystemInitialized) {
    if (currentStep === "selection") {
      return <ModelSelection onNext={handleModelSelection} />;
    }

    if (currentStep === "configuration") {
      return (
        <BuildingConfig
          items={buildings}
          buildings={configuredBuildings}
          onNext={handleBuildingConfiguration}
          onBack={handleBackFromConfiguration}
        />
      );
    }
  }

  // Render dashboard
  if (currentStep === "dashboard" && selectedModelType) {
    return (
      <ModelDashboard
        modelType={selectedModelType}
        onUpdateRatio={
          selectedModelType === "decentralized" ? handleUpdateRatio : undefined
        }
      />
    );
  }

  // Fallback
  return null;
}
