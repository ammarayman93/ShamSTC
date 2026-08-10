import { m as generateUtilityClass, n as generateUtilityClasses, r as reactExports, o as useDefaultProps, u as useTheme, f as Paper, a8 as Fade, _ as _objectWithoutPropertiesLoose, l as _extends, p as useId, j as jsxRuntimeExports, q as clsx, z as capitalize, v as composeClasses, w as styled, a9 as Modal, aa as Backdrop, T as Typography } from "./index-CvPhQGw5.js";
function getDialogUtilityClass(slot) {
  return generateUtilityClass("MuiDialog", slot);
}
const dialogClasses = generateUtilityClasses("MuiDialog", ["root", "scrollPaper", "scrollBody", "container", "paper", "paperScrollPaper", "paperScrollBody", "paperWidthFalse", "paperWidthXs", "paperWidthSm", "paperWidthMd", "paperWidthLg", "paperWidthXl", "paperFullWidth", "paperFullScreen"]);
const DialogContext = /* @__PURE__ */ reactExports.createContext({});
const _excluded$3 = ["aria-describedby", "aria-labelledby", "BackdropComponent", "BackdropProps", "children", "className", "disableEscapeKeyDown", "fullScreen", "fullWidth", "maxWidth", "onBackdropClick", "onClick", "onClose", "open", "PaperComponent", "PaperProps", "scroll", "TransitionComponent", "transitionDuration", "TransitionProps"];
const DialogBackdrop = styled(Backdrop, {
  name: "MuiDialog",
  slot: "Backdrop",
  overrides: (props, styles) => styles.backdrop
})({
  // Improve scrollable dialog support.
  zIndex: -1
});
const useUtilityClasses$3 = (ownerState) => {
  const {
    classes,
    scroll,
    maxWidth,
    fullWidth,
    fullScreen
  } = ownerState;
  const slots = {
    root: ["root"],
    container: ["container", `scroll${capitalize(scroll)}`],
    paper: ["paper", `paperScroll${capitalize(scroll)}`, `paperWidth${capitalize(String(maxWidth))}`, fullWidth && "paperFullWidth", fullScreen && "paperFullScreen"]
  };
  return composeClasses(slots, getDialogUtilityClass, classes);
};
const DialogRoot = styled(Modal, {
  name: "MuiDialog",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  "@media print": {
    // Use !important to override the Modal inline-style.
    position: "absolute !important"
  }
});
const DialogContainer = styled("div", {
  name: "MuiDialog",
  slot: "Container",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.container, styles[`scroll${capitalize(ownerState.scroll)}`]];
  }
})(({
  ownerState
}) => _extends({
  height: "100%",
  "@media print": {
    height: "auto"
  },
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0
}, ownerState.scroll === "paper" && {
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}, ownerState.scroll === "body" && {
  overflowY: "auto",
  overflowX: "hidden",
  textAlign: "center",
  "&::after": {
    content: '""',
    display: "inline-block",
    verticalAlign: "middle",
    height: "100%",
    width: "0"
  }
}));
const DialogPaper = styled(Paper, {
  name: "MuiDialog",
  slot: "Paper",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.paper, styles[`scrollPaper${capitalize(ownerState.scroll)}`], styles[`paperWidth${capitalize(String(ownerState.maxWidth))}`], ownerState.fullWidth && styles.paperFullWidth, ownerState.fullScreen && styles.paperFullScreen];
  }
})(({
  theme,
  ownerState
}) => _extends({
  margin: 32,
  position: "relative",
  overflowY: "auto",
  // Fix IE11 issue, to remove at some point.
  "@media print": {
    overflowY: "visible",
    boxShadow: "none"
  }
}, ownerState.scroll === "paper" && {
  display: "flex",
  flexDirection: "column",
  maxHeight: "calc(100% - 64px)"
}, ownerState.scroll === "body" && {
  display: "inline-block",
  verticalAlign: "middle",
  textAlign: "left"
  // 'initial' doesn't work on IE11
}, !ownerState.maxWidth && {
  maxWidth: "calc(100% - 64px)"
}, ownerState.maxWidth === "xs" && {
  maxWidth: theme.breakpoints.unit === "px" ? Math.max(theme.breakpoints.values.xs, 444) : `max(${theme.breakpoints.values.xs}${theme.breakpoints.unit}, 444px)`,
  [`&.${dialogClasses.paperScrollBody}`]: {
    [theme.breakpoints.down(Math.max(theme.breakpoints.values.xs, 444) + 32 * 2)]: {
      maxWidth: "calc(100% - 64px)"
    }
  }
}, ownerState.maxWidth && ownerState.maxWidth !== "xs" && {
  maxWidth: `${theme.breakpoints.values[ownerState.maxWidth]}${theme.breakpoints.unit}`,
  [`&.${dialogClasses.paperScrollBody}`]: {
    [theme.breakpoints.down(theme.breakpoints.values[ownerState.maxWidth] + 32 * 2)]: {
      maxWidth: "calc(100% - 64px)"
    }
  }
}, ownerState.fullWidth && {
  width: "calc(100% - 64px)"
}, ownerState.fullScreen && {
  margin: 0,
  width: "100%",
  maxWidth: "100%",
  height: "100%",
  maxHeight: "none",
  borderRadius: 0,
  [`&.${dialogClasses.paperScrollBody}`]: {
    margin: 0,
    maxWidth: "100%"
  }
}));
const Dialog = /* @__PURE__ */ reactExports.forwardRef(function Dialog2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialog"
  });
  const theme = useTheme();
  const defaultTransitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen
  };
  const {
    "aria-describedby": ariaDescribedby,
    "aria-labelledby": ariaLabelledbyProp,
    BackdropComponent,
    BackdropProps,
    children,
    className,
    disableEscapeKeyDown = false,
    fullScreen = false,
    fullWidth = false,
    maxWidth = "sm",
    onBackdropClick,
    onClick,
    onClose,
    open,
    PaperComponent = Paper,
    PaperProps = {},
    scroll = "paper",
    TransitionComponent = Fade,
    transitionDuration = defaultTransitionDuration,
    TransitionProps
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$3);
  const ownerState = _extends({}, props, {
    disableEscapeKeyDown,
    fullScreen,
    fullWidth,
    maxWidth,
    scroll
  });
  const classes = useUtilityClasses$3(ownerState);
  const backdropClick = reactExports.useRef();
  const handleMouseDown = (event) => {
    backdropClick.current = event.target === event.currentTarget;
  };
  const handleBackdropClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    if (!backdropClick.current) {
      return;
    }
    backdropClick.current = null;
    if (onBackdropClick) {
      onBackdropClick(event);
    }
    if (onClose) {
      onClose(event, "backdropClick");
    }
  };
  const ariaLabelledby = useId(ariaLabelledbyProp);
  const dialogContextValue = reactExports.useMemo(() => {
    return {
      titleId: ariaLabelledby
    };
  }, [ariaLabelledby]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogRoot, _extends({
    className: clsx(classes.root, className),
    closeAfterTransition: true,
    components: {
      Backdrop: DialogBackdrop
    },
    componentsProps: {
      backdrop: _extends({
        transitionDuration,
        as: BackdropComponent
      }, BackdropProps)
    },
    disableEscapeKeyDown,
    onClose,
    open,
    ref,
    onClick: handleBackdropClick,
    ownerState
  }, other, {
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionComponent, _extends({
      appear: true,
      in: open,
      timeout: transitionDuration,
      role: "presentation"
    }, TransitionProps, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContainer, {
        className: clsx(classes.container),
        onMouseDown: handleMouseDown,
        ownerState,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPaper, _extends({
          as: PaperComponent,
          elevation: 24,
          role: "dialog",
          "aria-describedby": ariaDescribedby,
          "aria-labelledby": ariaLabelledby
        }, PaperProps, {
          className: clsx(classes.paper, PaperProps.className),
          ownerState,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContext.Provider, {
            value: dialogContextValue,
            children
          })
        }))
      })
    }))
  }));
});
function getDialogActionsUtilityClass(slot) {
  return generateUtilityClass("MuiDialogActions", slot);
}
generateUtilityClasses("MuiDialogActions", ["root", "spacing"]);
const _excluded$2 = ["className", "disableSpacing"];
const useUtilityClasses$2 = (ownerState) => {
  const {
    classes,
    disableSpacing
  } = ownerState;
  const slots = {
    root: ["root", !disableSpacing && "spacing"]
  };
  return composeClasses(slots, getDialogActionsUtilityClass, classes);
};
const DialogActionsRoot = styled("div", {
  name: "MuiDialogActions",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, !ownerState.disableSpacing && styles.spacing];
  }
})(({
  ownerState
}) => _extends({
  display: "flex",
  alignItems: "center",
  padding: 8,
  justifyContent: "flex-end",
  flex: "0 0 auto"
}, !ownerState.disableSpacing && {
  "& > :not(style) ~ :not(style)": {
    marginLeft: 8
  }
}));
const DialogActions = /* @__PURE__ */ reactExports.forwardRef(function DialogActions2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialogActions"
  });
  const {
    className,
    disableSpacing = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$2);
  const ownerState = _extends({}, props, {
    disableSpacing
  });
  const classes = useUtilityClasses$2(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActionsRoot, _extends({
    className: clsx(classes.root, className),
    ownerState,
    ref
  }, other));
});
function getDialogContentUtilityClass(slot) {
  return generateUtilityClass("MuiDialogContent", slot);
}
generateUtilityClasses("MuiDialogContent", ["root", "dividers"]);
function getDialogTitleUtilityClass(slot) {
  return generateUtilityClass("MuiDialogTitle", slot);
}
const dialogTitleClasses = generateUtilityClasses("MuiDialogTitle", ["root"]);
const _excluded$1 = ["className", "dividers"];
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    dividers
  } = ownerState;
  const slots = {
    root: ["root", dividers && "dividers"]
  };
  return composeClasses(slots, getDialogContentUtilityClass, classes);
};
const DialogContentRoot = styled("div", {
  name: "MuiDialogContent",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.dividers && styles.dividers];
  }
})(({
  theme,
  ownerState
}) => _extends({
  flex: "1 1 auto",
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
  overflowY: "auto",
  padding: "20px 24px"
}, ownerState.dividers ? {
  padding: "16px 24px",
  borderTop: `1px solid ${(theme.vars || theme).palette.divider}`,
  borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`
} : {
  [`.${dialogTitleClasses.root} + &`]: {
    paddingTop: 0
  }
}));
const DialogContent = /* @__PURE__ */ reactExports.forwardRef(function DialogContent2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialogContent"
  });
  const {
    className,
    dividers = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
  const ownerState = _extends({}, props, {
    dividers
  });
  const classes = useUtilityClasses$1(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentRoot, _extends({
    className: clsx(classes.root, className),
    ownerState,
    ref
  }, other));
});
const _excluded = ["className", "id"];
const useUtilityClasses = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getDialogTitleUtilityClass, classes);
};
const DialogTitleRoot = styled(Typography, {
  name: "MuiDialogTitle",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  padding: "16px 24px",
  flex: "0 0 auto"
});
const DialogTitle = /* @__PURE__ */ reactExports.forwardRef(function DialogTitle2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialogTitle"
  });
  const {
    className,
    id: idProp
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = props;
  const classes = useUtilityClasses(ownerState);
  const {
    titleId = idProp
  } = reactExports.useContext(DialogContext);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitleRoot, _extends({
    component: "h2",
    className: clsx(classes.root, className),
    ownerState,
    ref,
    variant: "h6",
    id: idProp != null ? idProp : titleId
  }, other));
});
export {
  Dialog as D,
  DialogTitle as a,
  DialogContent as b,
  DialogActions as c
};
//# sourceMappingURL=DialogTitle-C2f6jZ-e.js.map
