function normalizeEventName(name) {
  return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
}

export { normalizeEventName };
