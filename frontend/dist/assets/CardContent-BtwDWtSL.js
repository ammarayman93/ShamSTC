import { m as generateUtilityClass, n as generateUtilityClasses, r as reactExports, o as useDefaultProps, _ as _objectWithoutPropertiesLoose, l as _extends, j as jsxRuntimeExports, q as clsx, v as composeClasses, w as styled, f as Paper } from "./index-CvPhQGw5.js";
function getCardUtilityClass(slot) {
  return generateUtilityClass("MuiCard", slot);
}
generateUtilityClasses("MuiCard", ["root"]);
const _excluded$1 = ["className", "raised"];
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getCardUtilityClass, classes);
};
const CardRoot = styled(Paper, {
  name: "MuiCard",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})(() => {
  return {
    overflow: "hidden"
  };
});
const Card = /* @__PURE__ */ reactExports.forwardRef(function Card2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiCard"
  });
  const {
    className,
    raised = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
  const ownerState = _extends({}, props, {
    raised
  });
  const classes = useUtilityClasses$1(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CardRoot, _extends({
    className: clsx(classes.root, className),
    elevation: raised ? 8 : void 0,
    ref,
    ownerState
  }, other));
});
function getCardContentUtilityClass(slot) {
  return generateUtilityClass("MuiCardContent", slot);
}
generateUtilityClasses("MuiCardContent", ["root"]);
const _excluded = ["className", "component"];
const useUtilityClasses = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getCardContentUtilityClass, classes);
};
const CardContentRoot = styled("div", {
  name: "MuiCardContent",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})(() => {
  return {
    padding: 16,
    "&:last-child": {
      paddingBottom: 24
    }
  };
});
const CardContent = /* @__PURE__ */ reactExports.forwardRef(function CardContent2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiCardContent"
  });
  const {
    className,
    component = "div"
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = _extends({}, props, {
    component
  });
  const classes = useUtilityClasses(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CardContentRoot, _extends({
    as: component,
    className: clsx(classes.root, className),
    ownerState,
    ref
  }, other));
});
export {
  Card as C,
  CardContent as a
};
//# sourceMappingURL=CardContent-BtwDWtSL.js.map
