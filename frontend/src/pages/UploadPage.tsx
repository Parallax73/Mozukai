import React, { useState, useEffect } from "react";
import { 
  Typography, 
  Button, 
  Box, 
  Paper,
  Chip,
  CircularProgress,
  Fab,
  Collapse,
  Card,
  CardContent,
  CardActions,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider
} from "@mui/material";
import { 
  Add,
  Download,
  AccessTime,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Close
} from "@mui/icons-material";
import PipelineService from "../services/PipelineService";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (running && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running, startTime]);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.zip')) {
        setShowAlert(true);
        return;
      }
      setFile(selectedFile);
      setProgressMessages([]);
      setJobId(null);
      setElapsedTime(0);
    }
  }

  function handleStartPipeline() {
    if (!file) return;
    setUploadDialogOpen(false);
    startUpload();
  }

  async function startUpload() {
    if (!file) return;
    
    setRunning(true);
    setProgressMessages([]);
    setJobId(null);
    setStartTime(new Date());
    setElapsedTime(0);

    try {
      await PipelineService.runPipeline(
        file, 
        (msg) => {
          setProgressMessages((old) => [...old, msg]);
          if (msg === "PIPELINE:FINISHED") {
            setRunning(false);
          }
        },
        () => {},
        (completedJobId) => {
          setJobId(completedJobId);
        }
      );
    } catch (error) {
      setProgressMessages((old) => [...old, `Erro: ${error}`]);
      setRunning(false);
    }
  }

  async function downloadResults() {
    if (!jobId) return;
    
    try {
      await PipelineService.downloadResults(jobId);
    } catch (error) {
      console.error("Download failed:", error);
      setProgressMessages((old) => [...old, `Erro no download: ${error}`]);
    }
  }

  const hasActivePipeline = running || jobId;

  return (
    <Box sx={{ minHeight: '100vh', pt: 10 }}>
      <Box maxWidth={1000} mx="auto" p={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <Fab 
            color="primary" 
            onClick={() => setUploadDialogOpen(true)}
            sx={{ boxShadow: 3 }}
          >
            <Add />
          </Fab>
        </Box>

        <Box sx={{ minHeight: 400 }}>
          {!hasActivePipeline ? (
            <Paper 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                backgroundColor: 'white',
                border: '2px dashed #e0e0e0'
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Nada está sendo executado no momento
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Para começar a pipeline clique no "+"
              </Typography>
            </Paper>
          ) : (
            <Card sx={{ boxShadow: 2 }}>
              <CardContent 
                sx={{ 
                  cursor: 'pointer'
                }}
                onClick={() => setExpanded(!expanded)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {running && <CircularProgress size={20} />}
                    {!running && jobId && <CheckCircle color="success" />}
                    
                    <Typography variant="h6" noWrap>
                      {file?.name || "Pipeline"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {running && (
                      <Chip 
                        icon={<AccessTime />}
                        label={formatTime(elapsedTime)}
                        size="small"
                        color="primary"
                      />
                    )}
                    
                    {!running && jobId && (
                      <Chip 
                        label="Pronto para download"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </Box>
              </CardContent>
              
              {!running && jobId && (
                <CardActions sx={{ pt: 0 }}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadResults();
                    }}
                    color="success"
                    size="small"
                  >
                    Download
                  </Button>
                </CardActions>
              )}
              
              <Collapse in={expanded}>
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Log da Pipeline:
                  </Typography>
                  <Paper 
                    variant="outlined"
                    sx={{
                      height: 300,
                      overflowY: "auto",
                      p: 2,
                      fontFamily: "monospace",
                      fontSize: 12,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    {progressMessages.length === 0 && (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Aguardando início da pipeline...
                      </Typography>
                    )}
                    {progressMessages.map((msg, i) => (
                      <Typography 
                        key={i} 
                        variant="body2" 
                        component="div" 
                        sx={{ 
                          fontFamily: 'inherit',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          color: msg.startsWith('ERROR') ? 'error.main' : 
                                 msg.startsWith('PROGRESS') ? 'primary.main' : 'inherit'
                        }}
                      >
                        {msg}
                      </Typography>
                    ))}
                  </Paper>
                </CardContent>
              </Collapse>
            </Card>
          )}
        </Box>
      </Box>

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Selecionar Arquivo ZIP
          <IconButton onClick={() => setUploadDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              style={{ 
                padding: '12px',
                border: '2px dashed #e0e0e0',
                borderRadius: '8px',
                width: '100%',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            />
            {file && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  Arquivo selecionado: <strong>{file.name}</strong>
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleStartPipeline}
            disabled={!file}
          >
            Iniciar Pipeline
          </Button>
        </DialogActions>
      </Dialog>

      {showAlert && (
        <Alert 
          severity="error" 
          onClose={() => setShowAlert(false)}
          sx={{ 
            position: 'fixed', 
            top: 100, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 9999,
            minWidth: 300
          }}
        >
          Apenas arquivos .zip são aceitos
        </Alert>
      )}
    </Box>
  );
}