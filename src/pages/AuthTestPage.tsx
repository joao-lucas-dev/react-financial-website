import React, { useState } from 'react'
import { Button, Card, Typography, Space, Divider, Alert, Progress, Tag } from 'antd'
import { ReloadOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import authManager from '../api/authManager'

const { Title, Text, Paragraph } = Typography

interface TestResult {
  id: string
  endpoint: string
  status: 'pending' | 'success' | 'error'
  duration?: number
  error?: string
  timestamp: number
}

const AuthTestPage: React.FC = () => {
  const axiosPrivate = useAxiosPrivate()
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [authState, setAuthState] = useState(authManager.getState())

  // Atualiza o estado do authManager periodicamente durante os testes
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setAuthState(authManager.getState())
      }, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const updateResult = (id: string, update: Partial<TestResult>) => {
    setResults(prev => prev.map(result => 
      result.id === id ? { ...result, ...update } : result
    ))
  }

  const simulateMultipleCalls = async () => {
    setIsRunning(true)
    setResults([])
    
    const endpoints = [
      '/transactions/overview',
      '/transactions/balance',
      '/transactions/recent',
      '/transactions/preview',
      '/categories',
      '/credit-cards',
      '/transactions/summary-periods',
      '/transactions',
      '/categories/summary',
      '/transactions/monthly-summary'
    ]

    // Cria os resultados iniciais
    const initialResults: TestResult[] = endpoints.map((endpoint, index) => ({
      id: `test_${index}`,
      endpoint,
      status: 'pending',
      timestamp: Date.now()
    }))
    
    setResults(initialResults)

    // Faz todas as chamadas simultaneamente
    const promises = initialResults.map(async (result) => {
      const startTime = Date.now()
      
      try {
        // Adiciona parâmetros fictícios para alguns endpoints
        let url = result.endpoint
        if (url.includes('overview') || url.includes('balance') || url.includes('preview')) {
          url += '?startDate=2024-01-01&endDate=2024-01-31'
        }
        if (url.includes('recent')) {
          url += '?filter=both&sort=updated_at&direction=DESC&type=all'
        }
        if (url.includes('/transactions') && !url.includes('/transactions/')) {
          url += '?month=1&year=2024'
        }
        
        // Log removido
        
        await axiosPrivate.get(url)
        
        const duration = Date.now() - startTime
        
        updateResult(result.id, {
          status: 'success',
          duration
        })
      } catch (error: any) {
        const duration = Date.now() - startTime
        console.error(`❌ [Test] Request ${result.id} failed after ${duration}ms:`, error)
        
        updateResult(result.id, {
          status: 'error',
          duration,
          error: error.response?.data?.message || error.message || 'Unknown error'
        })
      }
    })

    await Promise.allSettled(promises)
    setIsRunning(false)
    // Log removido
  }

  const clearResults = () => {
    setResults([])
    setAuthState(authManager.getState())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green'
      case 'error': return 'red'
      case 'pending': return 'blue'
      default: return 'default'
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const pendingCount = results.filter(r => r.status === 'pending').length
  const progress = results.length > 0 ? ((successCount + errorCount) / results.length) * 100 : 0

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🔐 Teste de Autenticação - Múltiplas Chamadas</Title>
      
      <Paragraph>
        Esta página testa o novo sistema de autenticação fazendo múltiplas chamadas simultâneas para diferentes endpoints.
        O objetivo é verificar se todas as requests são adequadamente retried após o refresh do token.
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Controles */}
        <Card title="Controles do Teste">
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={simulateMultipleCalls}
              loading={isRunning}
              disabled={isRunning}
            >
              Iniciar Teste de Múltiplas Chamadas
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={clearResults}
              disabled={isRunning}
            >
              Limpar Resultados
            </Button>
          </Space>
        </Card>

        {/* Estado do AuthManager */}
        <Card title="Estado do Authentication Manager">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Token: </Text>
              <Tag color={authState.hasToken ? 'green' : 'red'}>
                {authState.hasToken ? 'Presente' : 'Ausente'}
              </Tag>
            </div>
            <div>
              <Text strong>Refreshing: </Text>
              <Tag color={authState.isRefreshing ? 'orange' : 'green'}>
                {authState.isRefreshing ? 'Sim' : 'Não'}
              </Tag>
            </div>
            <div>
              <Text strong>Requests Pendentes: </Text>
              <Tag color={authState.pendingRequestsCount > 0 ? 'orange' : 'green'}>
                {authState.pendingRequestsCount}
              </Tag>
            </div>
            <div>
              <Text strong>Contador de Requests: </Text>
              <Text>{authState.requestCounter}</Text>
            </div>
          </Space>
        </Card>

        {/* Progress */}
        {results.length > 0 && (
          <Card title="Progresso do Teste">
            <Progress
              percent={Math.round(progress)}
              status={isRunning ? 'active' : progress === 100 ? 'success' : 'normal'}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <Tag color="green">Sucesso: {successCount}</Tag>
                <Tag color="red">Erro: {errorCount}</Tag>
                <Tag color="blue">Pendente: {pendingCount}</Tag>
                <Tag>Total: {results.length}</Tag>
              </Space>
            </div>
          </Card>
        )}

        {/* Resultados */}
        {results.length > 0 && (
          <Card title="Resultados das Chamadas">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {results.map((result) => (
                <Card
                  key={result.id}
                  size="small"
                  style={{
                    borderLeft: `4px solid ${
                      result.status === 'success' ? '#52c41a' :
                      result.status === 'error' ? '#ff4d4f' :
                      '#1890ff'
                    }`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{result.endpoint}</Text>
                      {result.duration && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ({result.duration}ms)
                        </Text>
                      )}
                    </div>
                    <Tag color={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Tag>
                  </div>
                  {result.error && (
                    <Alert
                      message={result.error}
                      type="error"
                      size="small"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </Card>
              ))}
            </Space>
          </Card>
        )}

        {/* Instruções */}
        <Card title="Como Testar">
          <Space direction="vertical">
            <Paragraph>
              <Text strong>1. Configurar Token Expirado:</Text> Certifique-se de que o access token está expirado ou próximo de expirar.
            </Paragraph>
            <Paragraph>
              <Text strong>2. Executar Teste:</Text> Clique em "Iniciar Teste" para fazer múltiplas chamadas simultâneas.
            </Paragraph>
            <Paragraph>
              <Text strong>3. Observar Comportamento:</Text> Todas as chamadas devem ser bem-sucedidas após o refresh automático do token.
            </Paragraph>
            <Paragraph>
              <Text strong>4. Verificar Logs:</Text> Abra o console do navegador para ver os logs detalhados do processo de autenticação.
            </Paragraph>
          </Space>
        </Card>
      </Space>
    </div>
  )
}

export default AuthTestPage
