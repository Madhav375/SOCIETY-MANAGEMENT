import { useCallback, useEffect, useRef, useState } from "react";

/** Runs an async loader on mount; exposes { data, loading, error, reload, setData }. */
export default function useFetch(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const alive = useRef(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loaderRef.current();
      if (alive.current) setData(result);
      return result;
    } catch (err) {
      if (alive.current) setError(err.message);
      return null;
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    reload();
    return () => {
      alive.current = false;
    };
  }, [reload]);

  return { data, loading, error, reload, setData };
}
