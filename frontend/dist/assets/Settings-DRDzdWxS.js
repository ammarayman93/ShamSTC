import { m as generateUtilityClass, n as generateUtilityClasses, r as reactExports, _ as _objectWithoutPropertiesLoose, Z as useControlled, L as useFormControl, l as _extends, j as jsxRuntimeExports, q as clsx, z as capitalize, v as composeClasses, w as styled, X as ButtonBase, $ as rootShouldForwardProp, o as useDefaultProps, a0 as formControlState, T as Typography, a1 as Stack, G as lighten_1, H as darken_1, Y as alpha_1, c as createSvgIcon, a as api, C as CircularProgress, B as Box, A as Alert, f as Paper, g as TextField, D as Divider, e as Button, I as IconButton } from "./index-CvPhQGw5.js";
import { T as Tabs, a as Tab } from "./Tabs-BznsVJTZ.js";
import { G as Grid } from "./Grid-Bap928i5.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-D4VL4rNK.js";
import { D as DownloadIcon } from "./Download-QngAMRlE.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-C2f6jZ-e.js";
import "./KeyboardArrowRight-nMvpNNjv.js";
function getSwitchBaseUtilityClass(slot) {
  return generateUtilityClass("PrivateSwitchBase", slot);
}
generateUtilityClasses("PrivateSwitchBase", ["root", "checked", "disabled", "input", "edgeStart", "edgeEnd"]);
const _excluded$2 = ["autoFocus", "checked", "checkedIcon", "className", "defaultChecked", "disabled", "disableFocusRipple", "edge", "icon", "id", "inputProps", "inputRef", "name", "onBlur", "onChange", "onFocus", "readOnly", "required", "tabIndex", "type", "value"];
const useUtilityClasses$2 = (ownerState) => {
  const {
    classes,
    checked,
    disabled,
    edge
  } = ownerState;
  const slots = {
    root: ["root", checked && "checked", disabled && "disabled", edge && `edge${capitalize(edge)}`],
    input: ["input"]
  };
  return composeClasses(slots, getSwitchBaseUtilityClass, classes);
};
const SwitchBaseRoot = styled(ButtonBase, {
  name: "MuiSwitchBase"
})(({
  ownerState
}) => _extends({
  padding: 9,
  borderRadius: "50%"
}, ownerState.edge === "start" && {
  marginLeft: ownerState.size === "small" ? -3 : -12
}, ownerState.edge === "end" && {
  marginRight: ownerState.size === "small" ? -3 : -12
}));
const SwitchBaseInput = styled("input", {
  name: "MuiSwitchBase",
  shouldForwardProp: rootShouldForwardProp
})({
  cursor: "inherit",
  position: "absolute",
  opacity: 0,
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  margin: 0,
  padding: 0,
  zIndex: 1
});
const SwitchBase = /* @__PURE__ */ reactExports.forwardRef(function SwitchBase2(props, ref) {
  const {
    autoFocus,
    checked: checkedProp,
    checkedIcon,
    className,
    defaultChecked,
    disabled: disabledProp,
    disableFocusRipple = false,
    edge = false,
    icon,
    id,
    inputProps,
    inputRef,
    name,
    onBlur,
    onChange,
    onFocus,
    readOnly,
    required = false,
    tabIndex,
    type,
    value
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$2);
  const [checked, setCheckedState] = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: "SwitchBase",
    state: "checked"
  });
  const muiFormControl = useFormControl();
  const handleFocus = (event) => {
    if (onFocus) {
      onFocus(event);
    }
    if (muiFormControl && muiFormControl.onFocus) {
      muiFormControl.onFocus(event);
    }
  };
  const handleBlur = (event) => {
    if (onBlur) {
      onBlur(event);
    }
    if (muiFormControl && muiFormControl.onBlur) {
      muiFormControl.onBlur(event);
    }
  };
  const handleInputChange = (event) => {
    if (event.nativeEvent.defaultPrevented) {
      return;
    }
    const newChecked = event.target.checked;
    setCheckedState(newChecked);
    if (onChange) {
      onChange(event, newChecked);
    }
  };
  let disabled = disabledProp;
  if (muiFormControl) {
    if (typeof disabled === "undefined") {
      disabled = muiFormControl.disabled;
    }
  }
  const hasLabelFor = type === "checkbox" || type === "radio";
  const ownerState = _extends({}, props, {
    checked,
    disabled,
    disableFocusRipple,
    edge
  });
  const classes = useUtilityClasses$2(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchBaseRoot, _extends({
    component: "span",
    className: clsx(classes.root, className),
    centerRipple: true,
    focusRipple: !disableFocusRipple,
    disabled,
    tabIndex: null,
    role: void 0,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ownerState,
    ref
  }, other, {
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(SwitchBaseInput, _extends({
      autoFocus,
      checked: checkedProp,
      defaultChecked,
      className: classes.input,
      disabled,
      id: hasLabelFor ? id : void 0,
      name,
      onChange: handleInputChange,
      readOnly,
      ref: inputRef,
      required,
      ownerState,
      tabIndex,
      type
    }, type === "checkbox" && value === void 0 ? {} : {
      value
    }, inputProps)), checked ? checkedIcon : icon]
  }));
});
function getFormControlLabelUtilityClasses(slot) {
  return generateUtilityClass("MuiFormControlLabel", slot);
}
const formControlLabelClasses = generateUtilityClasses("MuiFormControlLabel", ["root", "labelPlacementStart", "labelPlacementTop", "labelPlacementBottom", "disabled", "label", "error", "required", "asterisk"]);
const _excluded$1 = ["checked", "className", "componentsProps", "control", "disabled", "disableTypography", "inputRef", "label", "labelPlacement", "name", "onChange", "required", "slotProps", "value"];
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    disabled,
    labelPlacement,
    error,
    required
  } = ownerState;
  const slots = {
    root: ["root", disabled && "disabled", `labelPlacement${capitalize(labelPlacement)}`, error && "error", required && "required"],
    label: ["label", disabled && "disabled"],
    asterisk: ["asterisk", error && "error"]
  };
  return composeClasses(slots, getFormControlLabelUtilityClasses, classes);
};
const FormControlLabelRoot = styled("label", {
  name: "MuiFormControlLabel",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${formControlLabelClasses.label}`]: styles.label
    }, styles.root, styles[`labelPlacement${capitalize(ownerState.labelPlacement)}`]];
  }
})(({
  theme,
  ownerState
}) => _extends({
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
  // For correct alignment with the text.
  verticalAlign: "middle",
  WebkitTapHighlightColor: "transparent",
  marginLeft: -11,
  marginRight: 16,
  // used for row presentation of radio/checkbox
  [`&.${formControlLabelClasses.disabled}`]: {
    cursor: "default"
  }
}, ownerState.labelPlacement === "start" && {
  flexDirection: "row-reverse",
  marginLeft: 16,
  // used for row presentation of radio/checkbox
  marginRight: -11
}, ownerState.labelPlacement === "top" && {
  flexDirection: "column-reverse",
  marginLeft: 16
}, ownerState.labelPlacement === "bottom" && {
  flexDirection: "column",
  marginLeft: 16
}, {
  [`& .${formControlLabelClasses.label}`]: {
    [`&.${formControlLabelClasses.disabled}`]: {
      color: (theme.vars || theme).palette.text.disabled
    }
  }
}));
const AsteriskComponent = styled("span", {
  name: "MuiFormControlLabel",
  slot: "Asterisk",
  overridesResolver: (props, styles) => styles.asterisk
})(({
  theme
}) => ({
  [`&.${formControlLabelClasses.error}`]: {
    color: (theme.vars || theme).palette.error.main
  }
}));
const FormControlLabel = /* @__PURE__ */ reactExports.forwardRef(function FormControlLabel2(inProps, ref) {
  var _ref, _slotProps$typography;
  const props = useDefaultProps({
    props: inProps,
    name: "MuiFormControlLabel"
  });
  const {
    className,
    componentsProps = {},
    control,
    disabled: disabledProp,
    disableTypography,
    label: labelProp,
    labelPlacement = "end",
    required: requiredProp,
    slotProps = {}
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
  const muiFormControl = useFormControl();
  const disabled = (_ref = disabledProp != null ? disabledProp : control.props.disabled) != null ? _ref : muiFormControl == null ? void 0 : muiFormControl.disabled;
  const required = requiredProp != null ? requiredProp : control.props.required;
  const controlProps = {
    disabled,
    required
  };
  ["checked", "name", "onChange", "value", "inputRef"].forEach((key) => {
    if (typeof control.props[key] === "undefined" && typeof props[key] !== "undefined") {
      controlProps[key] = props[key];
    }
  });
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ["error"]
  });
  const ownerState = _extends({}, props, {
    disabled,
    labelPlacement,
    required,
    error: fcs.error
  });
  const classes = useUtilityClasses$1(ownerState);
  const typographySlotProps = (_slotProps$typography = slotProps.typography) != null ? _slotProps$typography : componentsProps.typography;
  let label = labelProp;
  if (label != null && label.type !== Typography && !disableTypography) {
    label = /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, _extends({
      component: "span"
    }, typographySlotProps, {
      className: clsx(classes.label, typographySlotProps == null ? void 0 : typographySlotProps.className),
      children: label
    }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControlLabelRoot, _extends({
    className: clsx(classes.root, className),
    ownerState,
    ref
  }, other, {
    children: [/* @__PURE__ */ reactExports.cloneElement(control, controlProps), required ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, {
      display: "block",
      children: [label, /* @__PURE__ */ jsxRuntimeExports.jsxs(AsteriskComponent, {
        ownerState,
        "aria-hidden": true,
        className: classes.asterisk,
        children: [" ", "*"]
      })]
    }) : label]
  }));
});
function getSwitchUtilityClass(slot) {
  return generateUtilityClass("MuiSwitch", slot);
}
const switchClasses = generateUtilityClasses("MuiSwitch", ["root", "edgeStart", "edgeEnd", "switchBase", "colorPrimary", "colorSecondary", "sizeSmall", "sizeMedium", "checked", "disabled", "input", "thumb", "track"]);
const _excluded = ["className", "color", "edge", "size", "sx"];
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    edge,
    size,
    color,
    checked,
    disabled
  } = ownerState;
  const slots = {
    root: ["root", edge && `edge${capitalize(edge)}`, `size${capitalize(size)}`],
    switchBase: ["switchBase", `color${capitalize(color)}`, checked && "checked", disabled && "disabled"],
    thumb: ["thumb"],
    track: ["track"],
    input: ["input"]
  };
  const composedClasses = composeClasses(slots, getSwitchUtilityClass, classes);
  return _extends({}, classes, composedClasses);
};
const SwitchRoot = styled("span", {
  name: "MuiSwitch",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.edge && styles[`edge${capitalize(ownerState.edge)}`], styles[`size${capitalize(ownerState.size)}`]];
  }
})({
  display: "inline-flex",
  width: 34 + 12 * 2,
  height: 14 + 12 * 2,
  overflow: "hidden",
  padding: 12,
  boxSizing: "border-box",
  position: "relative",
  flexShrink: 0,
  zIndex: 0,
  // Reset the stacking context.
  verticalAlign: "middle",
  // For correct alignment with the text.
  "@media print": {
    colorAdjust: "exact"
  },
  variants: [{
    props: {
      edge: "start"
    },
    style: {
      marginLeft: -8
    }
  }, {
    props: {
      edge: "end"
    },
    style: {
      marginRight: -8
    }
  }, {
    props: {
      size: "small"
    },
    style: {
      width: 40,
      height: 24,
      padding: 7,
      [`& .${switchClasses.thumb}`]: {
        width: 16,
        height: 16
      },
      [`& .${switchClasses.switchBase}`]: {
        padding: 4,
        [`&.${switchClasses.checked}`]: {
          transform: "translateX(16px)"
        }
      }
    }
  }]
});
const SwitchSwitchBase = styled(SwitchBase, {
  name: "MuiSwitch",
  slot: "SwitchBase",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.switchBase, {
      [`& .${switchClasses.input}`]: styles.input
    }, ownerState.color !== "default" && styles[`color${capitalize(ownerState.color)}`]];
  }
})(({
  theme
}) => ({
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: 1,
  // Render above the focus ripple.
  color: theme.vars ? theme.vars.palette.Switch.defaultColor : `${theme.palette.mode === "light" ? theme.palette.common.white : theme.palette.grey[300]}`,
  transition: theme.transitions.create(["left", "transform"], {
    duration: theme.transitions.duration.shortest
  }),
  [`&.${switchClasses.checked}`]: {
    transform: "translateX(20px)"
  },
  [`&.${switchClasses.disabled}`]: {
    color: theme.vars ? theme.vars.palette.Switch.defaultDisabledColor : `${theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600]}`
  },
  [`&.${switchClasses.checked} + .${switchClasses.track}`]: {
    opacity: 0.5
  },
  [`&.${switchClasses.disabled} + .${switchClasses.track}`]: {
    opacity: theme.vars ? theme.vars.opacity.switchTrackDisabled : `${theme.palette.mode === "light" ? 0.12 : 0.2}`
  },
  [`& .${switchClasses.input}`]: {
    left: "-100%",
    width: "300%"
  }
}), ({
  theme
}) => ({
  "&:hover": {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})` : alpha_1(theme.palette.action.active, theme.palette.action.hoverOpacity),
    // Reset on touch devices, it doesn't add specificity
    "@media (hover: none)": {
      backgroundColor: "transparent"
    }
  },
  variants: [...Object.entries(theme.palette).filter(([, value]) => value.main && value.light).map(([color]) => ({
    props: {
      color
    },
    style: {
      [`&.${switchClasses.checked}`]: {
        color: (theme.vars || theme).palette[color].main,
        "&:hover": {
          backgroundColor: theme.vars ? `rgba(${theme.vars.palette[color].mainChannel} / ${theme.vars.palette.action.hoverOpacity})` : alpha_1(theme.palette[color].main, theme.palette.action.hoverOpacity),
          "@media (hover: none)": {
            backgroundColor: "transparent"
          }
        },
        [`&.${switchClasses.disabled}`]: {
          color: theme.vars ? theme.vars.palette.Switch[`${color}DisabledColor`] : `${theme.palette.mode === "light" ? lighten_1(theme.palette[color].main, 0.62) : darken_1(theme.palette[color].main, 0.55)}`
        }
      },
      [`&.${switchClasses.checked} + .${switchClasses.track}`]: {
        backgroundColor: (theme.vars || theme).palette[color].main
      }
    }
  }))]
}));
const SwitchTrack = styled("span", {
  name: "MuiSwitch",
  slot: "Track",
  overridesResolver: (props, styles) => styles.track
})(({
  theme
}) => ({
  height: "100%",
  width: "100%",
  borderRadius: 14 / 2,
  zIndex: -1,
  transition: theme.transitions.create(["opacity", "background-color"], {
    duration: theme.transitions.duration.shortest
  }),
  backgroundColor: theme.vars ? theme.vars.palette.common.onBackground : `${theme.palette.mode === "light" ? theme.palette.common.black : theme.palette.common.white}`,
  opacity: theme.vars ? theme.vars.opacity.switchTrack : `${theme.palette.mode === "light" ? 0.38 : 0.3}`
}));
const SwitchThumb = styled("span", {
  name: "MuiSwitch",
  slot: "Thumb",
  overridesResolver: (props, styles) => styles.thumb
})(({
  theme
}) => ({
  boxShadow: (theme.vars || theme).shadows[1],
  backgroundColor: "currentColor",
  width: 20,
  height: 20,
  borderRadius: "50%"
}));
const Switch = /* @__PURE__ */ reactExports.forwardRef(function Switch2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiSwitch"
  });
  const {
    className,
    color = "primary",
    edge = false,
    size = "medium",
    sx
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = _extends({}, props, {
    color,
    edge,
    size
  });
  const classes = useUtilityClasses(ownerState);
  const icon = /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchThumb, {
    className: classes.thumb,
    ownerState
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchRoot, {
    className: clsx(classes.root, className),
    sx,
    ownerState,
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(SwitchSwitchBase, _extends({
      type: "checkbox",
      icon,
      checkedIcon: icon,
      ref,
      ownerState
    }, other, {
      classes: _extends({}, classes, {
        root: classes.switchBase
      })
    })), /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchTrack, {
      className: classes.track,
      ownerState
    })]
  });
});
const BackupIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96M14 13v4h-4v-4H7l5-5 5 5z"
}), "Backup");
const BusinessIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 7V3H2v18h20V7zM6 19H4v-2h2zm0-4H4v-2h2zm0-4H4V9h2zm0-4H4V5h2zm4 12H8v-2h2zm0-4H8v-2h2zm0-4H8V9h2zm0-4H8V5h2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8zm-2-8h-2v2h2zm0 4h-2v2h2z"
}), "Business");
const EmailIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z"
}), "Email");
const PaymentIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4v-6h16zm0-10H4V6h16z"
}), "Payment");
const RestoreIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z"
}), "Restore");
const SecurityIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11z"
}), "Security");
function Settings() {
  const [tabValue, setTabValue] = reactExports.useState(0);
  const [settings, setSettings] = reactExports.useState([]);
  const [backups, setBackups] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [success, setSuccess] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [restoreDialogOpen, setRestoreDialogOpen] = reactExports.useState(false);
  const [restoreFile, setRestoreFile] = reactExports.useState(null);
  reactExports.useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, []);
  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings");
      if (response.data.success)
        setSettings(response.data.data);
    } catch (error2) {
      console.error(error2);
    } finally {
      setLoading(false);
    }
  };
  const fetchBackups = async () => {
    try {
      const response = await api.get("/backup/list");
      if (response.data.success)
        setBackups(response.data.data);
    } catch (error2) {
      console.error(error2);
    }
  };
  const updateSetting = async (key, value) => {
    setSaving(true);
    try {
      await api.put(`/settings/${key}`, { value, group: "general" });
      setSuccess("تم حفظ الإعدادات");
      setTimeout(() => setSuccess(""), 3e3);
    } catch (error2) {
      console.error(error2);
    } finally {
      setSaving(false);
    }
  };
  const handleCreateBackup = async () => {
    try {
      const response = await api.post("/backup/create", {}, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `backup_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess("تم إنشاء النسخة الاحتياطية");
      fetchBackups();
    } catch (error2) {
      setError("فشل إنشاء النسخة الاحتياطية");
    }
  };
  const handleRestoreBackup = async () => {
    if (!restoreFile)
      return;
    const formData = new FormData();
    formData.append("file", restoreFile);
    try {
      await api.post("/backup/restore", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("تم استعادة النسخة الاحتياطية بنجاح");
      setRestoreDialogOpen(false);
      setRestoreFile(null);
    } catch (error2) {
      setError("فشل استعادة النسخة الاحتياطية");
    }
  };
  const getSettingValue = (key) => {
    var _a;
    return ((_a = settings.find((s) => s.key === key)) == null ? void 0 : _a.value) || "";
  };
  if (loading)
    return jsxRuntimeExports.jsx(CircularProgress, {});
  return jsxRuntimeExports.jsxs(Box, { children: [jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "إعدادات النظام" }), success && jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), error && jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), jsxRuntimeExports.jsxs(Paper, { sx: { width: "100%" }, children: [jsxRuntimeExports.jsxs(Tabs, { value: tabValue, onChange: (_, v) => setTabValue(v), children: [jsxRuntimeExports.jsx(Tab, { icon: jsxRuntimeExports.jsx(BusinessIcon, {}), label: "عام" }), jsxRuntimeExports.jsx(Tab, { icon: jsxRuntimeExports.jsx(EmailIcon, {}), label: "الإشعارات" }), jsxRuntimeExports.jsx(Tab, { icon: jsxRuntimeExports.jsx(PaymentIcon, {}), label: "الدفع" }), jsxRuntimeExports.jsx(Tab, { icon: jsxRuntimeExports.jsx(BackupIcon, {}), label: "النسخ الاحتياطي" }), jsxRuntimeExports.jsx(Tab, { icon: jsxRuntimeExports.jsx(SecurityIcon, {}), label: "الأمان" })] }), tabValue === 0 && jsxRuntimeExports.jsx(Box, { p: 3, children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "اسم الشركة", value: getSettingValue("company_name"), onChange: (e) => updateSetting("company_name", e.target.value) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "الشعار (URL)", value: getSettingValue("company_logo"), onChange: (e) => updateSetting("company_logo", e.target.value) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "البريد الإلكتروني", value: getSettingValue("company_email"), onChange: (e) => updateSetting("company_email", e.target.value) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "رقم الهاتف", value: getSettingValue("company_phone"), onChange: (e) => updateSetting("company_phone", e.target.value) }) }), jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "العنوان", multiline: true, rows: 2, value: getSettingValue("company_address"), onChange: (e) => updateSetting("company_address", e.target.value) }) })] }) }), tabValue === 1 && jsxRuntimeExports.jsxs(Box, { p: 3, children: [jsxRuntimeExports.jsx(FormControlLabel, { control: jsxRuntimeExports.jsx(Switch, { checked: getSettingValue("notify_expiring") === "true", onChange: (e) => updateSetting("notify_expiring", String(e.target.checked)) }), label: "إشعار عند اقتراب انتهاء الاشتراك" }), jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }), jsxRuntimeExports.jsx(FormControlLabel, { control: jsxRuntimeExports.jsx(Switch, { checked: getSettingValue("notify_overdue") === "true", onChange: (e) => updateSetting("notify_overdue", String(e.target.checked)) }), label: "إشعار عند تأخر الفواتير" }), jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }), jsxRuntimeExports.jsx(FormControlLabel, { control: jsxRuntimeExports.jsx(Switch, { checked: getSettingValue("notify_low_stock") === "true", onChange: (e) => updateSetting("notify_low_stock", String(e.target.checked)) }), label: "إشعار عند انخفاض المخزون" }), jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "أيام الإشعار قبل الانتهاء", type: "number", value: getSettingValue("expiry_days") || "3", onChange: (e) => updateSetting("expiry_days", e.target.value), sx: { mt: 2 } })] }), tabValue === 2 && jsxRuntimeExports.jsxs(Box, { p: 3, children: [jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "رقم الحساب البنكي", value: getSettingValue("bank_account"), onChange: (e) => updateSetting("bank_account", e.target.value), sx: { mb: 2 } }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "اسم البنك", value: getSettingValue("bank_name"), onChange: (e) => updateSetting("bank_name", e.target.value), sx: { mb: 2 } }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "IBAN", value: getSettingValue("iban"), onChange: (e) => updateSetting("iban", e.target.value), sx: { mb: 2 } })] }), tabValue === 3 && jsxRuntimeExports.jsx(Box, { p: 3, children: jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: jsxRuntimeExports.jsx(BackupIcon, {}), onClick: handleCreateBackup, children: "إنشاء نسخة احتياطية" }), jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: jsxRuntimeExports.jsx(RestoreIcon, {}), onClick: () => setRestoreDialogOpen(true), sx: { ml: 2 }, children: "استعادة نسخة" })] }), jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 2 }, children: "النسخ الاحتياطية السابقة" }), jsxRuntimeExports.jsx(TableContainer, { component: Paper, variant: "outlined", children: jsxRuntimeExports.jsxs(Table, { children: [jsxRuntimeExports.jsx(TableHead, { children: jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: "اسم الملف" }), jsxRuntimeExports.jsx(TableCell, { children: "الحجم" }), jsxRuntimeExports.jsx(TableCell, { children: "التاريخ" }), jsxRuntimeExports.jsx(TableCell, { children: "الإجراءات" })] }) }), jsxRuntimeExports.jsx(TableBody, { children: backups.map((backup) => jsxRuntimeExports.jsxs(TableRow, { children: [jsxRuntimeExports.jsx(TableCell, { children: backup.name }), jsxRuntimeExports.jsxs(TableCell, { children: [(backup.size / 1024).toFixed(2), " KB"] }), jsxRuntimeExports.jsx(TableCell, { children: new Date(backup.createdAt).toLocaleString("ar-EG") }), jsxRuntimeExports.jsx(TableCell, { children: jsxRuntimeExports.jsx(IconButton, { size: "small", color: "primary", onClick: () => window.open(`/backups/${backup.name}`), children: jsxRuntimeExports.jsx(DownloadIcon, { fontSize: "small" }) }) })] }, backup.name)) })] }) })] })] }) }), tabValue === 4 && jsxRuntimeExports.jsxs(Box, { p: 3, children: [jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "إعدادات الأمان" }), jsxRuntimeExports.jsx(FormControlLabel, { control: jsxRuntimeExports.jsx(Switch, { checked: getSettingValue("two_factor_auth") === "true", onChange: (e) => updateSetting("two_factor_auth", String(e.target.checked)) }), label: "تفعيل المصادقة الثنائية" }), jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }), jsxRuntimeExports.jsx(FormControlLabel, { control: jsxRuntimeExports.jsx(Switch, { checked: getSettingValue("session_timeout") === "true", onChange: (e) => updateSetting("session_timeout", String(e.target.checked)) }), label: "تسجيل الخروج تلقائياً بعد فترة عدم النشاط" }), jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }), jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "مدة الجلسة (بالدقائق)", type: "number", value: getSettingValue("session_minutes") || "60", onChange: (e) => updateSetting("session_minutes", e.target.value) })] })] }), jsxRuntimeExports.jsxs(Dialog, { open: restoreDialogOpen, onClose: () => setRestoreDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [jsxRuntimeExports.jsx(DialogTitle, { children: "استعادة نسخة احتياطية" }), jsxRuntimeExports.jsxs(DialogContent, { children: [jsxRuntimeExports.jsx("input", { type: "file", accept: ".sql", onChange: (e) => {
    var _a;
    return setRestoreFile(((_a = e.target.files) == null ? void 0 : _a[0]) || null);
  } }), jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "textSecondary", sx: { mt: 1, display: "block" }, children: "تحذير: استعادة النسخة الاحتياطية ستستبدل جميع البيانات الحالية" })] }), jsxRuntimeExports.jsxs(DialogActions, { children: [jsxRuntimeExports.jsx(Button, { onClick: () => setRestoreDialogOpen(false), children: "إلغاء" }), jsxRuntimeExports.jsx(Button, { onClick: handleRestoreBackup, variant: "contained", color: "warning", children: "استعادة" })] })] })] });
}
export {
  Settings as default
};
//# sourceMappingURL=Settings-DRDzdWxS.js.map
