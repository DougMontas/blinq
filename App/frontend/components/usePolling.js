import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import api from "../api/client";

export function useJobPolling({
  jobId,
  navigation,
  onComplete,
  forProvider = false,
}) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const phoneTimer = useRef(null);
  const aliveRef = useRef(true);

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
      if (!aliveRef.current) return;

      setJob(data);

      if (data.status === "completed") {
        onComplete?.();
        navigation.navigate(
          forProvider ? "ServiceProviderDashboard" : "CustomerDashboard"
        );
      }

      if (
        forProvider &&
        data.invitationAccepted &&
        !phoneTimer.current &&
        !showPhone
      ) {
        phoneTimer.current = setTimeout(() => {
          setShowPhone(true);
        }, 6 * 60 * 1000);
      }
    } catch (err) {
      const isAccepted = job?.invitationAccepted || job?.status === "invited";
      if (!isAccepted) {
        Alert.alert("Error", "Unable to load job");
      } else {
        console.warn("Suppressed fetch error post-invitation.");
      }
    } finally {
      aliveRef.current && setLoading(false);
    }
  };

  useEffect(() => {
    aliveRef.current = true;
    fetchJob();
    const interval = setInterval(fetchJob, 25000);

    return () => {
      aliveRef.current = false;
      clearInterval(interval);
      if (phoneTimer.current) clearTimeout(phoneTimer.current);
    };
  }, [jobId]);

  return { job, loading, showPhone, refetch: fetchJob };
}
