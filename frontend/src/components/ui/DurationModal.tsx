import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";
import { Button } from "./Button";

interface DurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationInMinutes: number) => void;
  fileName: string;
}

const PRESET_DURATIONS = [
  { label: "10 Minutes", value: 10 },
  { label: "1 Hour", value: 60 },
  { label: "1 Day", value: 1440 },
];

export const DurationModal = ({
  isOpen,
  onClose,
  onConfirm,
  fileName,
}: DurationModalProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [customUnit, setCustomUnit] = useState<"minutes" | "hours" | "days">(
    "hours"
  );

  const handleConfirm = () => {
    let duration: number;

    if (selectedDuration !== null) {
      duration = selectedDuration;
    } else if (customDuration) {
      const value = parseInt(customDuration);
      if (isNaN(value) || value <= 0) {
        return;
      }
      // Convert to minutes
      switch (customUnit) {
        case "minutes":
          duration = value;
          break;
        case "hours":
          duration = value * 60;
          break;
        case "days":
          duration = value * 1440;
          break;
      }
    } else {
      return;
    }

    onConfirm(duration);
    handleClose();
  };

  const handleClose = () => {
    setSelectedDuration(null);
    setCustomDuration("");
    setCustomUnit("hours");
    onClose();
  };

  const handlePresetClick = (value: number) => {
    setSelectedDuration(value);
    setCustomDuration("");
  };

  const handleCustomInput = (value: string) => {
    setCustomDuration(value);
    setSelectedDuration(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          // Backdrop
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          // Modal content
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-dark-700"
            >
             // Close button
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-dark-300 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              // Header
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Select Duration
                  </h3>
                  <p className="text-dark-300 text-sm">
                    How long to keep offline?
                  </p>
                </div>
              </div>

             // File name display
              <div className="mb-6 p-3 bg-dark-700/50 rounded-lg">
                <p className="text-sm text-dark-300 mb-1">Saving file:</p>
                <p className="text-white font-medium truncate">{fileName}</p>
              </div>

             // Preset durations
              <div className="mb-6">
                <p className="text-sm text-dark-300 mb-3">Quick Select:</p>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_DURATIONS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetClick(preset.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedDuration === preset.value
                          ? "border-primary-500 bg-primary-500/10 text-white"
                          : "border-dark-600 bg-dark-700/50 text-dark-300 hover:border-primary-500/50"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              // Custom duration
              <div className="mb-6">
                <p className="text-sm text-dark-300 mb-3">Custom Duration:</p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter value"
                    value={customDuration}
                    onChange={(e) => handleCustomInput(e.target.value)}
                    className={`flex-1 px-4 py-3 bg-dark-700 border-2 rounded-lg text-white placeholder-dark-400 focus:outline-none transition-colors ${
                      customDuration
                        ? "border-primary-500"
                        : "border-dark-600 focus:border-primary-500"
                    }`}
                  />
                  <select
                    value={customUnit}
                    onChange={(e) =>
                      setCustomUnit(
                        e.target.value as "minutes" | "hours" | "days"
                      )
                    }
                    className="px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    aria-label="Duration unit"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>

              // Info message
              <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  The file will be stored in your browser and accessible
                  offline. It will be automatically deleted after the selected
                  duration.
                </p>
              </div>

              // Action buttons
              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedDuration && !customDuration}
                  className="flex-1"
                >
                  Save Offline
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
