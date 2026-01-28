import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Save, 
  Copy, 
  History, 
  Eye,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { WorkflowDefinition } from '@/lib/api'
import { apiService } from '@/lib/apiService'
import { formatDate } from '@/lib/utils'

interface WorkflowEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow: WorkflowDefinition | null
  onSave: (workflow: WorkflowDefinition) => void
}

interface WorkflowVersion {
  id: number
  version: number
  workflowName: string
  createTime: string
  status: number
  comment?: string
}

export function WorkflowEditDialog({ 
  open, 
  onOpenChange, 
  workflow, 
  onSave 
}: WorkflowEditDialogProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [versions, setVersions] = useState<WorkflowVersion[]>([])
  const [formData, setFormData] = useState({
    workflowName: '',
    workflowKey: '',
    workflowDesc: '',
    category: '',
    formId: undefined as number | undefined,
    icon: '',
    comment: ''
  })

  useEffect(() => {
    if (workflow && open) {
      setFormData({
        workflowName: workflow.workflowName,
        workflowKey: workflow.workflowKey,
        workflowDesc: workflow.workflowDesc || '',
        category: workflow.category || '',
        formId: workflow.formId,
        icon: workflow.icon || '',
        comment: ''
      })
      loadWorkflowVersions()
    }
  }, [workflow, open])

  const loadWorkflowVersions = async () => {
    if (!workflow) return
    
    setLoading(true)
    try {
      // 模拟版本数据
      const mockVersions: WorkflowVersion[] = [
        {
          id: workflow.id,
          version: workflow.version,
          workflowName: workflow.workflowName,
          createTime: workflow.updateTime,
          status: workflow.status,
          comment: '当前版本'
        },
        {
          id: workflow.id - 1,
          version: workflow.version - 1,
          workflowName: workflow.workflowName,
          createTime: '2024-01-15 10:30:00',
          status: 0,
          comment: '优化审批流程'
        },
        {
          id: workflow.id - 2,
          version: workflow.version - 2,
          workflowName: workflow.workflowName,
          createTime: '2024-01-10 14:20:00',
          status: 0,
          comment: '初始版本'
        }
      ]
      
      setVersions(mockVersions)
    } catch (error) {
      console.error('加载版本历史失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!workflow) return
    
    setSaving(true)
    try {
      const response = await apiService.workflow.updateDefinition(workflow.id, {
        workflowKey: formData.workflowKey,
        workflowName: formData.workflowName,
        workflowDesc: formData.workflowDesc,
        category: formData.category,
        formId: formData.formId,
        icon: formData.icon
      })
      
      if (response.code === 200) {
        const updatedWorkflow = {
          ...workflow,
          ...formData
        }
        onSave(updatedWorkflow)
        onOpenChange(false)
      } else {
        alert(`保存失败: ${response.message}`)
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNewVersion = async () => {
    if (!workflow) return
    
    if (window.confirm('确定要创建新版本吗？新版本将基于当前版本创建')) {
      setSaving(true)
      try {
        const response = await apiService.workflow.createDefinition({
          workflowKey: `${workflow.workflowKey}_V${workflow.version + 1}`,
          workflowName: `${workflow.workflowName} V${workflow.version + 1}`,
          workflowDesc: formData.workflowDesc,
          category: formData.category,
          formId: formData.formId,
          icon: formData.icon
        })
        
        if (response.code === 200) {
          alert('新版本创建成功')
          onOpenChange(false)
        }
      } catch (error) {
        console.error('创建新版本失败:', error)
        alert('创建新版本失败，请稍后重试')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleRevertToVersion = async (version: WorkflowVersion) => {
    if (!workflow) return
    
    if (window.confirm(`确定要回滚到版本 ${version.version} 吗？当前修改将丢失`)) {
      setSaving(true)
      try {
        const response = await apiService.workflow.updateDefinition(workflow.id, {
          workflowKey: workflow.workflowKey,
          workflowName: version.workflowName,
          workflowDesc: formData.workflowDesc,
          category: formData.category,
          formId: formData.formId,
          icon: formData.icon
        })
        
        if (response.code === 200) {
          alert('回滚成功')
          onOpenChange(false)
        }
      } catch (error) {
        console.error('回滚失败:', error)
        alert('回滚失败，请稍后重试')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleExportWorkflow = () => {
    if (!workflow) return
    
    const exportData = {
      workflow: workflow,
      config: formData,
      versions: versions
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${workflow.workflowKey}_v${workflow.version}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        
        if (importedData.config) {
          setFormData(importedData.config)
        }
        
        alert('导入成功')
      } catch (error) {
        console.error('导入失败:', error)
        alert('导入失败，文件格式不正确')
      }
    }
    
    reader.readAsText(file)
    event.target.value = '' // 重置input
  }

  if (!workflow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>编辑流程 - {workflow.workflowName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="versions">版本管理</TabsTrigger>
            <TabsTrigger value="importExport">导入导出</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">流程基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workflowName">流程名称</Label>
                    <Input
                      id="workflowName"
                      value={formData.workflowName}
                      onChange={(e) => setFormData({...formData, workflowName: e.target.value})}
                      placeholder="请输入流程名称"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workflowKey">流程关键字</Label>
                    <Input
                      id="workflowKey"
                      value={formData.workflowKey}
                      onChange={(e) => setFormData({...formData, workflowKey: e.target.value.toUpperCase()})}
                      placeholder="请输入流程关键字"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workflowDesc">流程描述</Label>
                  <Textarea
                    id="workflowDesc"
                    value={formData.workflowDesc}
                    onChange={(e) => setFormData({...formData, workflowDesc: e.target.value})}
                    placeholder="请输入流程描述"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">流程分类</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="请输入流程分类"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="icon">图标</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      placeholder="请输入图标名称或URL"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comment">修改说明</Label>
                  <Textarea
                    id="comment"
                    value={formData.comment}
                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                    placeholder="请简要说明本次修改内容"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">流程状态信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>当前版本</Label>
                    <div className="mt-1 text-lg font-semibold">v{workflow.version}</div>
                  </div>
                  
                  <div>
                    <Label>状态</Label>
                    <div className="mt-1">
                      <Badge className={workflow.status === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {workflow.status === 1 ? '已启用' : '未启用'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label>创建时间</Label>
                    <div className="mt-1 text-sm">{formatDate(workflow.createTime)}</div>
                  </div>
                  
                  <div>
                    <Label>最后修改</Label>
                    <div className="mt-1 text-sm">{formatDate(workflow.updateTime)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="versions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">版本历史</CardTitle>
                  <Button onClick={handleCreateNewVersion} size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    创建新版本
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <div>加载中...</div>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无版本历史
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div key={version.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant={version.id === workflow.id ? "default" : "outline"}>
                                v{version.version}
                              </Badge>
                              {version.id === workflow.id && (
                                <Badge variant="secondary">当前版本</Badge>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{version.workflowName}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(version.createTime)}
                                {version.comment && ` • ${version.comment}`}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {version.id !== workflow.id && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRevertToVersion(version)}
                              >
                                回滚到此版本
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <History className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="importExport" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">导出流程</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    导出当前流程的配置信息，包括基本信息、版本历史和配置数据。
                  </p>
                  <Button onClick={handleExportWorkflow} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    导出流程配置
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">导入流程</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    导入流程配置文件，将覆盖当前流程的配置信息。
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">拖拽文件到此处或点击选择文件</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportWorkflow}
                      className="hidden"
                      id="import-file"
                    />
                    <label htmlFor="import-file">
                      <Button variant="outline" asChild>
                        <span>选择文件</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              最后修改: {formatDate(workflow.updateTime)}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存修改'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}