import { useForm, useStore } from '@tanstack/react-form'
import {
  Briefcase,
  Building2,
  Globe,
  ImagePlus,
  Mail,
  Phone,
  Trash2,
  User,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { GetCity, GetCountries, GetState } from 'react-country-state-city'
import { z } from 'zod'
import { Input } from '#/components/motion/input'
import type { InputProps } from '#/components/motion/input'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '#/components/motion/combobox'
import { Textarea } from '#/components/ui/textarea'
import { useToast } from '#/providers/toast-provider'
import {
  MAX_LOGO_SIZE,
  isAllowedLogoMime,
} from '#/features/clients/client.constants'
import {
  createClientDefaultValues,
  createClientSchema,
} from '#/features/clients/client.schema'

export const clientFormSchema = createClientSchema.extend({
  removeLogo: z.boolean(),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>

export const clientFormDefaultValues: ClientFormValues = {
  ...createClientDefaultValues,
  removeLogo: false,
}

export function useClientForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues: ClientFormValues
  onSubmit: (value: ClientFormValues) => void | Promise<void>
}) {
  return useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = clientFormSchema.safeParse(value)
        if (result.success) return undefined
        return result.error.issues[0]?.message ?? 'Invalid form'
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })
}

export type ClientFormApi = ReturnType<typeof useClientForm>

function fieldError(errors: unknown): string | undefined {
  if (!Array.isArray(errors) || errors.length === 0) return undefined
  const first: unknown = errors[0]
  if (typeof first === 'string') return first
  if (typeof first === 'object' && first !== null && 'message' in first) {
    const message = (first as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'Invalid value'
}

function blurField<TValue>(schema: z.ZodType<TValue>) {
  return ({ value }: { value: TValue }) => {
    const result = schema.safeParse(value)
    if (result.success) return undefined
    return result.error.issues[0]?.message ?? 'Invalid value'
  }
}

function RequiredMark() {
  return <span className="text-destructive"> *</span>
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="px-1 text-[13px] font-medium text-neutral-600"
    >
      {children}
    </label>
  )
}

const TEXT_FIELD_NAMES = [
  'companyName',
  'email',
  'phone',
  'website',
  'postalCode',
  'contactName',
  'contactPosition',
  'contactEmail',
  'contactPhone',
] as const

type TextFieldName = (typeof TEXT_FIELD_NAMES)[number]

function ClientTextField({
  form,
  name,
  label,
  required,
  ...inputProps
}: {
  form: ClientFormApi
  name: TextFieldName
  label: ReactNode
  required?: boolean
} & Omit<
  InputProps,
  | 'id'
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onBlur'
  | 'error'
  | 'form'
  | 'label'
>) {
  const id = `client-${name}`
  return (
    <form.Field
      name={name}
      validators={{ onBlur: blurField(createClientSchema.shape[name]) }}
    >
      {(field) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel htmlFor={id}>
            {label}
            {required ? <RequiredMark /> : null}
          </FieldLabel>
          <Input
            id={id}
            value={field.state.value ?? ''}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
            error={fieldError(field.state.meta.errors)}
            classNames={{ field: 'rounded-xl' }}
            {...inputProps}
          />
        </div>
      )}
    </form.Field>
  )
}

function ClientComboboxField({
  form,
  name,
  label,
  options,
  placeholder,
  disabled,
  onValueChange,
}: {
  form: ClientFormApi
  name: 'clientType' | 'country' | 'province' | 'city'
  label: ReactNode
  options: string[]
  placeholder: string
  disabled?: boolean
  onValueChange?: (value: string) => void
}) {
  return (
    <form.Field
      name={name}
      validators={{ onBlur: blurField(createClientSchema.shape[name]) }}
    >
      {(field) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel>{label}</FieldLabel>
          <Combobox
            value={field.state.value ?? ''}
            onValueChange={(value) => {
              field.handleChange(value)
              onValueChange?.(value)
            }}
            onOpenChange={(open) => {
              if (!open) field.handleBlur()
            }}
            disabled={disabled}
          >
            <ComboboxTrigger className="h-11 min-w-0 rounded-xl">
              <ComboboxInput
                placeholder={placeholder}
                aria-label={
                  typeof label === 'string' ? label : `Select ${name}`
                }
              />
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxList
                ariaLabel={typeof label === 'string' ? label : name}
              >
                <ComboboxEmpty>No results found.</ComboboxEmpty>
                {options.map((option) => (
                  <ComboboxItem key={option} value={option}>
                    {option}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {fieldError(field.state.meta.errors) ? (
            <p role="alert" className="px-1 text-xs text-destructive">
              {fieldError(field.state.meta.errors)}
            </p>
          ) : null}
        </div>
      )}
    </form.Field>
  )
}

interface GeoOption {
  id: number
  name: string
}

function withCurrentValue(names: string[], current: string | undefined) {
  if (current && !names.includes(current)) return [current, ...names]
  return names
}

function ClientLocationFields({ form }: { form: ClientFormApi }) {
  const countryValue = useStore(form.store, (state) => state.values.country)
  const provinceValue = useStore(form.store, (state) => state.values.province)
  const cityValue = useStore(form.store, (state) => state.values.city)

  const [countries, setCountries] = useState<GeoOption[]>([])
  const [states, setStates] = useState<GeoOption[]>([])
  const [cities, setCities] = useState<GeoOption[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoadingCountries(true)
    GetCountries()
      .then((data) => {
        if (cancelled) return
        setCountries((data as GeoOption[]).filter((item) => Boolean(item.name)))
      })
      .catch(() => {
        if (!cancelled) setCountries([])
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedCountry = useMemo(
    () => countries.find((item) => item.name === countryValue),
    [countries, countryValue],
  )
  const selectedCountryId = selectedCountry?.id

  useEffect(() => {
    if (!selectedCountryId) {
      setStates([])
      return
    }
    let cancelled = false
    setLoadingStates(true)
    GetState(selectedCountryId)
      .then((data) => {
        if (cancelled) return
        setStates((data as GeoOption[]).filter((item) => Boolean(item.name)))
      })
      .catch(() => {
        if (!cancelled) setStates([])
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedCountryId])

  const selectedState = useMemo(
    () => states.find((item) => item.name === provinceValue),
    [states, provinceValue],
  )
  const selectedStateId = selectedState?.id

  useEffect(() => {
    if (!selectedCountryId || !selectedStateId) {
      setCities([])
      return
    }
    let cancelled = false
    setLoadingCities(true)
    GetCity(selectedCountryId, selectedStateId)
      .then((data) => {
        if (cancelled) return
        setCities((data as GeoOption[]).filter((item) => Boolean(item.name)))
      })
      .catch(() => {
        if (!cancelled) setCities([])
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedCountryId, selectedStateId])

  const countryOptions = useMemo(
    () =>
      withCurrentValue(
        countries.map((item) => item.name),
        countryValue,
      ),
    [countries, countryValue],
  )
  const provinceOptions = useMemo(
    () =>
      withCurrentValue(
        states.map((item) => item.name),
        provinceValue,
      ),
    [states, provinceValue],
  )
  const cityOptions = useMemo(
    () =>
      withCurrentValue(
        cities.map((item) => item.name),
        cityValue,
      ),
    [cities, cityValue],
  )

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <ClientComboboxField
        form={form}
        name="country"
        label="Country"
        options={countryOptions}
        placeholder={loadingCountries ? 'Loading...' : 'Select country'}
        disabled={loadingCountries || countryOptions.length === 0}
        onValueChange={() => {
          form.setFieldValue('province', undefined)
          form.setFieldValue('city', undefined)
        }}
      />
      <ClientComboboxField
        form={form}
        name="province"
        label="State / Province"
        options={provinceOptions}
        placeholder={
          loadingStates
            ? 'Loading...'
            : !selectedCountry
              ? 'Select country first'
              : provinceOptions.length === 0
                ? 'No provinces'
                : 'Select province'
        }
        disabled={!selectedCountry || loadingStates}
        onValueChange={() => {
          form.setFieldValue('city', undefined)
        }}
      />
      <ClientComboboxField
        form={form}
        name="city"
        label="City"
        options={cityOptions}
        placeholder={
          loadingCities
            ? 'Loading...'
            : !selectedState
              ? 'Select province first'
              : cityOptions.length === 0
                ? 'No cities'
                : 'Select city'
        }
        disabled={!selectedState || loadingCities}
      />
      <ClientTextField
        form={form}
        name="postalCode"
        label="Postal Code"
        inputMode="numeric"
        placeholder="12950"
      />
    </div>
  )
}

function LogoField({
  form,
  existingLogoUrl,
}: {
  form: ClientFormApi
  existingLogoUrl: string | null
}) {
  const { showToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <form.Field name="logo">
      {(field) => {
        const picked = field.state.value
        const preview = picked
          ? `data:${picked.mime};base64,${picked.data}`
          : existingLogoUrl
        return (
          <div className="flex items-center gap-3">
            {preview ? (
              <img
                src={preview}
                alt="Client logo preview"
                className="size-14 shrink-0 rounded-2xl border border-border object-cover"
              />
            ) : (
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ImagePlus className="size-6" />
              </span>
            )}
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-[12.5px]"
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus data-icon="inline-start" />
                  {preview ? 'Change logo' : 'Upload logo'}
                </Button>
                {preview ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-[12.5px] text-destructive hover:text-destructive"
                    onClick={() => {
                      field.handleChange(undefined)
                      form.setFieldValue('removeLogo', Boolean(existingLogoUrl))
                      if (inputRef.current) inputRef.current.value = ''
                    }}
                  >
                    <Trash2 data-icon="inline-start" />
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="px-1 text-[11.5px] text-muted-foreground">
                PNG, JPG or WebP, max 2 MB.
              </p>
              {fieldError(field.state.meta.errors) ? (
                <p role="alert" className="px-1 text-xs text-destructive">
                  {fieldError(field.state.meta.errors)}
                </p>
              ) : null}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              aria-label="Client logo"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const mime = file.type
                if (!isAllowedLogoMime(mime)) {
                  showToast({
                    title: 'Invalid file type',
                    description: 'Logo must be PNG, JPG or WebP.',
                    status: 'error',
                  })
                  event.target.value = ''
                  return
                }
                if (file.size > MAX_LOGO_SIZE) {
                  showToast({
                    title: 'File too large',
                    description: 'Logo must be at most 2 MB.',
                    status: 'error',
                  })
                  event.target.value = ''
                  return
                }
                const reader = new FileReader()
                reader.onload = () => {
                  const result =
                    typeof reader.result === 'string' ? reader.result : ''
                  const base64 = result.split(',')[1] ?? ''
                  field.handleChange({ data: base64, mime })
                  form.setFieldValue('removeLogo', false)
                }
                reader.readAsDataURL(file)
              }}
            />
          </div>
        )
      }}
    </form.Field>
  )
}

function SectionCard({
  step,
  title,
  description,
  children,
}: {
  step: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="gap-0 rounded-2xl border-border bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] dark:shadow-none">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[14px] font-bold text-primary">
            {step}
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-neutral-900">{title}</h2>
            <p className="text-[12.5px] text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

export function ClientForm({
  form,
  existingLogoUrl,
  submitLabel,
  onCancel,
  serverError,
}: {
  form: ClientFormApi
  existingLogoUrl: string | null
  submitLabel: string
  onCancel: () => void
  serverError: string | null
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="flex min-w-0 flex-col gap-4"
    >
      <SectionCard
        step="1"
        title="Basic Information"
        description="Enter the main details of your client."
      >
        <LogoField form={form} existingLogoUrl={existingLogoUrl} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ClientTextField
            form={form}
            name="companyName"
            label="Company Name"
            required
            placeholder="PT Maju Bersama"
            leftIcon={<Building2 />}
          />
          <ClientComboboxField
            form={form}
            name="clientType"
            label="Client Type"
            options={['Company', 'Individual']}
            placeholder="Select type"
          />
          <ClientTextField
            form={form}
            name="email"
            label="Email"
            required
            type="email"
            placeholder="budi@maju-bersama.co.id"
            leftIcon={<Mail />}
          />
          <ClientTextField
            form={form}
            name="phone"
            label="Phone"
            type="tel"
            placeholder="+62 812 3456 7890"
            leftIcon={<Phone />}
          />
          <div className="sm:col-span-2">
            <ClientTextField
              form={form}
              name="website"
              label="Website"
              placeholder="www.maju-bersama.co.id"
              leftIcon={<Globe />}
            />
          </div>
          <div className="sm:col-span-2">
            <form.Field
              name="description"
              validators={{
                onBlur: blurField(createClientSchema.shape.description),
              }}
            >
              {(field) => (
                <div className="flex min-w-0 flex-col gap-1.5">
                  <FieldLabel htmlFor="client-description">
                    Company Description
                  </FieldLabel>
                  <Textarea
                    id="client-description"
                    placeholder="Briefly describe what this company does..."
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    rows={3}
                    aria-invalid={Boolean(fieldError(field.state.meta.errors))}
                    className="rounded-xl"
                  />
                  {fieldError(field.state.meta.errors) ? (
                    <p role="alert" className="px-1 text-xs text-destructive">
                      {fieldError(field.state.meta.errors)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        step="2"
        title="Address Information"
        description="Enter the client's billing address."
      >
        <form.Field
          name="billingAddress"
          validators={{
            onBlur: blurField(createClientSchema.shape.billingAddress),
          }}
        >
          {(field) => (
            <div className="flex min-w-0 flex-col gap-1.5">
              <FieldLabel htmlFor="client-billingAddress">
                Billing Address
                <RequiredMark />
              </FieldLabel>
              <Textarea
                id="client-billingAddress"
                placeholder="Jl. Gatot Subroto No. 45, Jakarta Selatan, Indonesia 12950"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                rows={3}
                aria-invalid={Boolean(fieldError(field.state.meta.errors))}
                className="rounded-xl"
              />
              {fieldError(field.state.meta.errors) ? (
                <p role="alert" className="px-1 text-xs text-destructive">
                  {fieldError(field.state.meta.errors)}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>
        <ClientLocationFields form={form} />
      </SectionCard>

      <SectionCard
        step="3"
        title="Contact Person"
        description="Add the primary contact person for this client."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ClientTextField
            form={form}
            name="contactName"
            label="Contact Name"
            required
            placeholder="Budi Santoso"
            leftIcon={<User />}
          />
          <ClientTextField
            form={form}
            name="contactPosition"
            label="Position"
            placeholder="Project Manager"
            leftIcon={<Briefcase />}
          />
          <ClientTextField
            form={form}
            name="contactEmail"
            label="Email"
            type="email"
            placeholder="budi@maju-bersama.co.id"
            leftIcon={<Mail />}
          />
          <ClientTextField
            form={form}
            name="contactPhone"
            label="Phone"
            type="tel"
            placeholder="+62 812 3456 7890"
            leftIcon={<Phone />}
          />
        </div>

        {serverError ? (
          <p
            role="alert"
            className="rounded-xl bg-error/10 px-3 py-2 text-xs font-medium text-error"
          >
            {serverError}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded-xl"
                  >
                    {isSubmitting ? 'Saving...' : submitLabel}
                  </Button>
                )}
              </form.Subscribe>
            )}
          </form.Subscribe>
        </div>
      </SectionCard>
    </form>
  )
}
