import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  TextInput,
  NumberInput,
  TextArea,
  Select,
  Checkbox,
  RadioGroup,
  ToggleSwitch,
  Slider,
  Badge,
  Alert,
  ProgressBar,
  Tabs,
  Breadcrumb,
  UploadZone,
  EmptyState,
  ConfirmationDialog,
} from '@/components/ui'
import { useNotificationStore } from '@/store'
import {
  PageHeader,
  Container,
  ContentWrapper,
} from '@/components/layout/Layout'
import { Settings, Image, Home, ChevronRight, FileText } from 'lucide-react'

export function ComponentsPage() {
  const [sliderValue, setSliderValue] = useState(50)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('tab1')
  const { addNotification } = useNotificationStore()

  const handleToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    addNotification(
      `This is a ${type} toast`,
      `Description for the ${type} notification message`,
      type,
    )
  }

  return (
    <Container className="pb-24 pt-4">
      <PageHeader
        title="Design System Showcase"
        description="A visual reference of all reusable components in the DocStudio UI library."
      />

      <ContentWrapper>
        {/* Buttons */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold border-b pb-2">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-2">
            <Button variant="primary" leftIcon={<Settings size={18} />}>
              With Icon
            </Button>
            <Button variant="secondary" isLoading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="outline" size="sm">
              Small
            </Button>
            <Button variant="outline" size="lg">
              Large
            </Button>
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold border-b pb-2">Form Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TextInput
                label="Text Input"
                placeholder="Enter some text..."
                description="Helper text goes here"
              />
              <TextInput
                label="With Error"
                placeholder="Invalid input"
                error="This field is required"
              />
              <TextInput
                label="With Icons"
                leftIcon={<Settings size={16} />}
                rightIcon={<ChevronRight size={16} />}
                placeholder="Search..."
              />
              <NumberInput label="Number Input" defaultValue={42} />
              <TextArea
                label="Text Area"
                placeholder="Write a longer message..."
                rows={3}
              />
            </div>
            <div className="space-y-6">
              <Select
                label="Select Dropdown"
                options={[
                  { label: 'Option 1', value: '1' },
                  { label: 'Option 2', value: '2' },
                ]}
              />
              <ToggleSwitch
                label="Toggle Switch"
                description="Enable this awesome feature"
                defaultChecked
              />
              <Checkbox
                label="Remember me"
                description="Save my login details for 30 days"
                defaultChecked
              />
              <RadioGroup
                name="example-radio"
                label="Radio Group"
                defaultValue="1"
                options={[
                  {
                    label: 'Standard Mode',
                    value: '1',
                    description: 'Best for most use cases',
                  },
                  {
                    label: 'Advanced Mode',
                    value: '2',
                    description: 'More configuration options',
                  },
                ]}
              />
              <Slider
                label="Quality Slider"
                min={0}
                max={100}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Feedback */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Feedback & Status
          </h2>

          <div className="flex flex-col gap-3 max-w-2xl">
            <Alert variant="default" title="Default Alert">
              This is a standard informational alert.
            </Alert>
            <Alert variant="info" title="Info Alert">
              This is some helpful information.
            </Alert>
            <Alert variant="success" title="Success Alert">
              The operation completed successfully.
            </Alert>
            <Alert variant="warning" title="Warning Alert">
              Be careful, something might be wrong.
            </Alert>
            <Alert variant="danger" title="Danger Alert">
              An error occurred during processing.
            </Alert>
          </div>

          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={() => handleToast('success')}>
              Success Toast
            </Button>
            <Button variant="outline" onClick={() => handleToast('error')}>
              Error Toast
            </Button>
            <Button variant="outline" onClick={() => handleToast('warning')}>
              Warning Toast
            </Button>
            <Button variant="outline" onClick={() => handleToast('info')}>
              Info Toast
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 items-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>

          <div className="flex flex-col gap-4 mt-4 max-w-md">
            <ProgressBar value={45} label="Uploading..." showValue />
            <ProgressBar value={100} color="success" size="sm" />
          </div>
        </section>

        {/* Layout & Containers */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Cards & Layout
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>
                  With header, content, and footer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  This is the main content of the card. It has some padding and
                  uses the design system's spacing.
                </p>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary">Save</Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Tabs
                activeId={activeTab}
                onChange={setActiveTab}
                tabs={[
                  { id: 'tab1', label: 'Images', icon: <Image size={16} /> },
                  {
                    id: 'tab2',
                    label: 'Documents',
                    icon: <FileText size={16} />,
                  },
                  { id: 'tab3', label: 'Settings', disabled: true },
                ]}
              />

              <Breadcrumb
                items={[
                  { label: 'Home', href: '/', icon: <Home size={14} /> },
                  { label: 'Dashboard', href: '/components' },
                  { label: 'Current Page' },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Specialized */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Specialized Components
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadZone onDropFiles={() => console.log('dropped')} />

            <EmptyState
              title="No files selected"
              description="Upload some files to get started with document processing."
              icon={<FileText size={24} />}
              action={<Button variant="primary">Upload Files</Button>}
            />
          </div>

          <div className="mt-4">
            <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
              Open Dialog
            </Button>
            <ConfirmationDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onConfirm={() => {
                setIsDialogOpen(false)
                handleToast('success')
              }}
              title="Delete Document?"
              description="Are you sure you want to delete this document? This action cannot be undone."
              isDestructive
              confirmText="Delete"
            />
          </div>
        </section>
      </ContentWrapper>
    </Container>
  )
}
