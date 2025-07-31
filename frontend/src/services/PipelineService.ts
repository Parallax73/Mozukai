import AuthService from "./AuthService";

const PipelineService = {
  baseUrl: "http://localhost:8000", // Main backend URL
  gpuServerUrl: "http://localhost:8090", // GPU server URL for direct downloads

  /**
   * Runs the photogrammetry pipeline by uploading a ZIP file.
   * Handles authentication with JWT, streams progress messages,
   * processes special messages for file tree and job completion.
   * 
   * @param file The ZIP file to upload
   * @param onProgressMessage Callback for progress messages (string)
   * @param onFileTree Optional callback for file tree JSON data
   * @param onJobComplete Optional callback when job completes with jobId
   */
  async runPipeline(
    file: File,
    onProgressMessage: (msg: string) => void,
    onFileTree: (tree: any) => void = () => {},
    onJobComplete: (jobId: string) => void = () => {}
  ): Promise<void> {
    let token = AuthService.getAccessToken();
    if (!token) {
      const refreshed = await AuthService.tryRefreshToken();
      if (refreshed) token = AuthService.getAccessToken();
    }
    if (!token || !AuthService.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${this.baseUrl}/run-pipeline/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }
      if (!response.body) throw new Error("Streaming not supported by server");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              const msg = part.slice(6).trim();
              if (msg) {
                if (msg.startsWith("FILETREE:")) {
                  try {
                    const treeData = JSON.parse(msg.slice(9));
                    onFileTree(treeData);
                  } catch (e) {
                    console.error("Failed to parse file tree:", e);
                  }
                } else if (msg.startsWith("JOB_COMPLETE:")) {
                  onJobComplete(msg.slice(13));
                } else {
                  onProgressMessage(msg);
                }
                if (msg === "PIPELINE:FINISHED") return;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Connection error: Please check if server is running");
      }
      throw error;
    }
  },

  /**
   * Downloads results ZIP file for a given job ID directly from GPU server.
   * Does not require authentication.
   * Triggers browser download.
   * Logs only start, end and errors to avoid memory issues.
   * 
   * @param jobId The job ID to download results for
   */
  async downloadResults(jobId: string): Promise<void> {
    try {
      console.log(`Starting download for job: ${jobId} from GPU server`);

      const response = await fetch(`${this.gpuServerUrl}/download/${jobId}`, { method: "GET" });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Download failed: ${response.status} - ${errorText}`);
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photogrammetry_results_${jobId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("Download completed successfully");
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  },

  async getJobFiles(jobId: string): Promise<any> {
    let token = AuthService.getAccessToken();
    if (!token) {
      const refreshed = await AuthService.tryRefreshToken();
      if (refreshed) token = AuthService.getAccessToken();
    }
    if (!token || !AuthService.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/files`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to get files: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Get files error:", error);
      throw error;
    }
  },

  async checkHealth(): Promise<{ status: string; gpu_server?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/pipeline/health`);
      return await response.json();
    } catch (error: any) {
      return { status: 'error', error: error?.message || 'Unknown error' };
    }
  }
};

export default PipelineService;
