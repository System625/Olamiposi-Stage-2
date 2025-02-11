'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Icon } from '@iconify/react'
import { Textarea } from '@/components/ui/textarea'
import { uploadToCloudinary } from '@/lib/cloudinary'

interface TicketData {
  type: string | null
  numberOfTickets: string
  fullName?: string
  email?: string
  profilePhoto?: string
  message?: string
}

interface TicketFormProps {
  onBack: () => void
  ticketData: TicketData
  onTicketDataChange: (data: TicketData) => void
  onSubmit: (formData: Partial<TicketData>) => void
}

const formSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens and apostrophes')
    .transform(val => val.trim()),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  profilePhoto: z.string()
    .min(1, 'Profile photo is required')
    .url('Profile photo must be a valid URL'),
  message: z.string()
    .max(500, 'Message must not exceed 500 characters')
    .optional()
    .transform(val => val?.trim()),
})

type FormValues = z.infer<typeof formSchema>

export default function TicketForm({ onBack, ticketData, onTicketDataChange, onSubmit }: TicketFormProps) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: ticketData.fullName || '',
      email: ticketData.email || '',
      profilePhoto: ticketData.profilePhoto || '',
      message: ticketData.message || '',
    },
    mode: 'onBlur',
  })
  
  useEffect(() => {
    const savedForm = localStorage.getItem('ticketForm')
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm)
      form.reset(parsedForm)
      if (parsedForm.profilePhoto) {
        setProfilePhoto(parsedForm.profilePhoto)
      }
    }
  }, [form])

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      onTicketDataChange({
        ...ticketData,
        ...values,
      })
      await onSubmit(values)
      toast.success('Ticket generated successfully!')
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to generate ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        setIsUploading(true)
        const reader = new FileReader()
        reader.onloadend = async () => {
          const result = reader.result as string
          setProfilePhoto(result) 

          try {            
            const cloudinaryUrl = await uploadToCloudinary(result)
            
            form.setValue('profilePhoto', cloudinaryUrl)
            onTicketDataChange({
              ...ticketData,
              profilePhoto: cloudinaryUrl,
            })
            toast.success('Image uploaded successfully!')
          } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Failed to upload image. Please try again.')
            setProfilePhoto(null)
            form.setValue('profilePhoto', '')
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error reading file:', error)
        toast.error('Failed to read image file. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto" role="main">
      <Card className="p-8 bg-transparent border border-[#197686] rounded-3xl">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="md:text-3xl text-lg mb-2 text-white" role="heading" aria-level={2}>Attendee Details</h2>
            <p className="text-sm relative top-[-4px] md:top-0 text-gray-200" aria-label="Form progress">Step 2/3</p>
          </div>

          <div className="w-full bg-[#07373F] h-2 rounded-full" role="progressbar" aria-valuenow={66} aria-valuemin={0} aria-valuemax={100}>
            <div className="bg-[#197686] h-full rounded-full w-[66%]"></div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 border border-[#07373F] bg-[#08252B] rounded-3xl p-4" noValidate>            
            <div className="mb-8 border border-[#07373F] bg-[#052228] rounded-3xl p-8 pb-10">
              <p className="mb-10 text-white" id="photo-upload-label">Upload Profile Photo</p>

              <div className="flex flex-col items-center justify-center bg-transparent md:bg-[#041B20] h-[200px] relative">
                <div 
                  className="w-full md:w-60 h-60 mx-auto bg-[#0E464F] border-4 border-[#24A0B5] rounded-3xl flex flex-col items-center justify-center cursor-pointer relative group -mt-8 -mb-8"
                  role="button"
                  tabIndex={0}
                  aria-label="Upload profile photo"
                  aria-describedby="photo-upload-label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    aria-label="Choose profile photo"
                  />
                  {profilePhoto ? (
                    <>
                      <img src={profilePhoto} alt="Profile preview" className="w-full h-full object-cover rounded-3xl" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-3xl">
                        <Icon icon="bx:cloud-download" className="w-6 h-6 mb-2 text-white" aria-hidden="true" />
                        <p className="text-center text-white">Click to replace image</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4">
                      {isUploading ? (
                        <div className="text-white" role="status" aria-live="polite">Uploading...</div>
                      ) : (
                        <>
                          <Icon icon="bx:cloud-download" className="w-6 h-6 mb-2 text-white" aria-hidden="true" />
                          <p className="text-center text-white">Drag & drop or click to upload</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {!form.getValues('profilePhoto') && form.formState.isSubmitted && (
              <p className="text-sm text-red-500 text-center" role="alert">Profile photo is required</p>
            )}

            <div className="border border-[#07373F] h-1 bg-[#07373F] rounded-3xl"></div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white' htmlFor={field.name}>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      id={field.name}
                      placeholder="John Doe" 
                      {...field} 
                      className="bg-transparent text-white border-[#07373F]"
                      aria-describedby={`${field.name}-error`}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage id={`${field.name}-error`} role="alert" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white' htmlFor={field.name}>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      id={field.name}
                      type="email" 
                      placeholder="hello@example.com" 
                      {...field} 
                      className="bg-transparent text-white border-[#07373F]"
                      aria-describedby={`${field.name}-error`}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage id={`${field.name}-error`} role="alert" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white' htmlFor={field.name}>Special Request?</FormLabel>
                  <FormControl>
                    <Textarea 
                      id={field.name}
                      placeholder="Enter your message" 
                      {...field} 
                      className="bg-transparent text-white border-[#07373F]"
                      aria-describedby={`${field.name}-error`}
                    />
                  </FormControl>
                  <FormMessage id={`${field.name}-error`} role="alert" />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-[#24A0B5] bg-transparent min-h-11 border-[#24A0B5] hover:bg-[#24A0B5]/10"
                onClick={onBack}
                aria-label="Go back to previous step"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 min-h-11 bg-[#24A0B5] text-white hover:bg-[#24A0B5]/90"
                disabled={isSubmitting}
                aria-label="Submit form and generate ticket"
              >
                {isSubmitting ? 'Generating...' : 
                  ticketData.type === 'VIP ACCESS' 
                    ? 'Purchase VIP Ticket'
                    : ticketData.type === 'VVIP ACCESS'
                    ? 'Purchase VVIP Ticket'
                    : 'Get My Free Ticket'
                }
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  )
} 