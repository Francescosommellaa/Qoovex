"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type FormVariant = "plain" | "ghost" | "surface" | "panel";
export type FormLayout = "stack" | "grid" | "inline";
export type FormDensity = "compact" | "comfortable" | "spacious";
export type FormTone = "neutral" | "primary" | "success" | "warning" | "error";
export type FormFieldStatus = "default" | "error" | "success";
export type FormFieldOrientation = "vertical" | "horizontal";
export type FormActionsAlign = "start" | "end" | "between" | "stretch";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  variant?: FormVariant;
  layout?: FormLayout;
  density?: FormDensity;
  tone?: FormTone;
}

export interface FormSlotProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface FormTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: FormTone;
}

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: FormActionsAlign;
}

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  successText?: React.ReactNode;
  status?: FormFieldStatus;
  orientation?: FormFieldOrientation;
  required?: boolean;
  disabled?: boolean;
  controlId?: string;
}

export interface FormLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export interface FormControlProps {
  children: React.ReactElement<FormControlElementProps>;
}

export interface FormMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

interface FormFieldContextValue {
  controlId: string;
  labelId: string;
  helperId: string;
  errorId: string;
  successId: string;
  describedBy?: string;
  status: FormFieldStatus;
  required: boolean;
  disabled: boolean;
}

interface FormControlElementProps {
  id?: string;
  status?: FormFieldStatus;
  disabled?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-labelledby"?: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const VARIANTS: Record<FormVariant, string> = {
  plain: "qv-form--plain",
  ghost: "qv-form--ghost",
  surface: "qv-form--surface",
  panel: "qv-form--panel",
};

const LAYOUTS: Record<FormLayout, string> = {
  stack: "qv-form--layout-stack",
  grid: "qv-form--layout-grid",
  inline: "qv-form--layout-inline",
};

const DENSITIES: Record<FormDensity, string> = {
  compact: "qv-form--density-compact",
  comfortable: "qv-form--density-comfortable",
  spacious: "qv-form--density-spacious",
};

const TONES: Record<FormTone, string> = {
  neutral: "qv-form--tone-neutral",
  primary: "qv-form--tone-primary",
  success: "qv-form--tone-success",
  warning: "qv-form--tone-warning",
  error: "qv-form--tone-error",
};

const FIELD_STATUS: Record<FormFieldStatus, string> = {
  default: "qv-form-field--status-default",
  error: "qv-form-field--status-error",
  success: "qv-form-field--status-success",
};

const FIELD_ORIENTATION: Record<FormFieldOrientation, string> = {
  vertical: "qv-form-field--vertical",
  horizontal: "qv-form-field--horizontal",
};

const ACTIONS_ALIGN: Record<FormActionsAlign, string> = {
  start: "qv-form-actions--start",
  end: "qv-form-actions--end",
  between: "qv-form-actions--between",
  stretch: "qv-form-actions--stretch",
};

function useFormFieldContext(componentName: string) {
  const context = React.useContext(FormFieldContext);

  if (!context) {
    throw new Error(`${componentName} must be used within FormField.`);
  }

  return context;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(
  {
    variant = "plain",
    layout = "stack",
    density = "comfortable",
    tone = "neutral",
    className,
    ...props
  },
  ref,
) {
  return (
    <form
      ref={ref}
      className={cn(
        "qv-form",
        VARIANTS[variant],
        LAYOUTS[layout],
        DENSITIES[density],
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
});

Form.displayName = "Form";

export const FormHeader = React.forwardRef<HTMLDivElement, FormSlotProps>(
  function FormHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn("qv-form__header", className)} {...props} />;
  },
);

FormHeader.displayName = "FormHeader";

export const FormTitle = React.forwardRef<HTMLHeadingElement, FormTitleProps>(
  function FormTitle({ className, ...props }, ref) {
    return <h2 ref={ref} className={cn("qv-form__title", className)} {...props} />;
  },
);

FormTitle.displayName = "FormTitle";

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(function FormDescription({ className, ...props }, ref) {
  return (
    <p ref={ref} className={cn("qv-form__description", className)} {...props} />
  );
});

FormDescription.displayName = "FormDescription";

export const FormContent = React.forwardRef<HTMLDivElement, FormSlotProps>(
  function FormContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn("qv-form__content", className)} {...props} />;
  },
);

FormContent.displayName = "FormContent";

export const FormSection = React.forwardRef<HTMLElement, FormSectionProps>(
  function FormSection({ tone = "neutral", className, ...props }, ref) {
    return (
      <section
        ref={ref}
        className={cn("qv-form-section", TONES[tone], className)}
        {...props}
      />
    );
  },
);

FormSection.displayName = "FormSection";

export const FormSectionHeader = React.forwardRef<HTMLDivElement, FormSlotProps>(
  function FormSectionHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("qv-form-section__header", className)}
        {...props}
      />
    );
  },
);

FormSectionHeader.displayName = "FormSectionHeader";

export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  function FormActions({ align = "end", className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("qv-form-actions", ACTIONS_ALIGN[align], className)}
        {...props}
      />
    );
  },
);

FormActions.displayName = "FormActions";

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField(
    {
      label,
      helperText,
      error,
      successText,
      status = error ? "error" : successText ? "success" : "default",
      orientation = "vertical",
      required = false,
      disabled = false,
      controlId,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const generatedId = React.useId();
    const fieldId = controlId ?? generatedId;
    const labelId = `${fieldId}-label`;
    const helperId = `${fieldId}-helper`;
    const errorId = `${fieldId}-error`;
    const successId = `${fieldId}-success`;
    const messageId =
      status === "error" && error
        ? errorId
        : status === "success" && successText
          ? successId
          : helperText
            ? helperId
            : undefined;
    const context = React.useMemo<FormFieldContextValue>(
      () => ({
        controlId: fieldId,
        labelId,
        helperId,
        errorId,
        successId,
        describedBy: messageId,
        status,
        required,
        disabled,
      }),
      [
        disabled,
        errorId,
        fieldId,
        helperId,
        labelId,
        messageId,
        required,
        status,
        successId,
      ],
    );

    return (
      <FormFieldContext.Provider value={context}>
        <div
          ref={ref}
          className={cn(
            "qv-form-field",
            FIELD_STATUS[status],
            FIELD_ORIENTATION[orientation],
            className,
          )}
          data-disabled={disabled ? "true" : undefined}
          {...props}
        >
          {label ? <FormLabel>{label}</FormLabel> : null}
          <div className="qv-form-field__control">{children}</div>
          {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
          {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
          {successText ? <FormSuccessMessage>{successText}</FormSuccessMessage> : null}
        </div>
      </FormFieldContext.Provider>
    );
  },
);

FormField.displayName = "FormField";

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  function FormLabel({ className, children, ...props }, ref) {
    const { controlId, labelId, required, disabled } =
      useFormFieldContext("FormLabel");

    return (
      <label
        ref={ref}
        id={labelId}
        htmlFor={props.htmlFor ?? controlId}
        className={cn("qv-form-field__label", className)}
        data-disabled={disabled ? "true" : undefined}
        {...props}
      >
        {children}
        {required ? (
          <span className="qv-form-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
    );
  },
);

FormLabel.displayName = "FormLabel";

export function FormControl({ children }: FormControlProps) {
  const {
    controlId,
    labelId,
    describedBy,
    status,
    disabled,
    required,
  } = useFormFieldContext("FormControl");
  const childProps = children.props;

  return React.cloneElement(children, {
    id: childProps.id ?? controlId,
    status,
    disabled: childProps.disabled ?? disabled,
    required: childProps.required ?? required,
    "aria-describedby": [childProps["aria-describedby"], describedBy]
      .filter(Boolean)
      .join(" ") || undefined,
    "aria-invalid": status === "error" || childProps["aria-invalid"] || undefined,
    "aria-labelledby": childProps["aria-labelledby"] ?? labelId,
  });
}

export const FormHelperText = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  function FormHelperText({ id, className, ...props }, ref) {
    const { helperId } = useFormFieldContext("FormHelperText");

    return (
      <p
        ref={ref}
        id={id ?? helperId}
        className={cn("qv-form-field__message qv-form-field__helper", className)}
        {...props}
      />
    );
  },
);

FormHelperText.displayName = "FormHelperText";

export const FormErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  FormMessageProps
>(function FormErrorMessage({ id, className, ...props }, ref) {
  const { errorId } = useFormFieldContext("FormErrorMessage");

  return (
    <p
      ref={ref}
      id={id ?? errorId}
      role="alert"
      className={cn("qv-form-field__message qv-form-field__error", className)}
      {...props}
    />
  );
});

FormErrorMessage.displayName = "FormErrorMessage";

export const FormSuccessMessage = React.forwardRef<
  HTMLParagraphElement,
  FormMessageProps
>(function FormSuccessMessage({ id, className, ...props }, ref) {
  const { successId } = useFormFieldContext("FormSuccessMessage");

  return (
    <p
      ref={ref}
      id={id ?? successId}
      className={cn("qv-form-field__message qv-form-field__success", className)}
      {...props}
    />
  );
});

FormSuccessMessage.displayName = "FormSuccessMessage";
