declare interface Window {
  SERVER_FLAGS: {
    alertManagerBaseURL: string;
    authDisabled: boolean;
    basePath: string;
    branding: string;
    consoleVersion: string;
    customLogoURL: string;
    customProductName: string;
    documentationBaseURL: string;
    kubeAPIServerURL: string;
    kubeAdminLogoutURL: string;
    kubectlClientID: string;
    loadTestFactor: number;
    loginErrorURL: string;
    loginSuccessURL: string;
    loginURL: string;
    logoutRedirect: string;
    logoutURL: string;
    meteringBaseURL: string;
    prometheusBaseURL: string;
    prometheusTenancyBaseURL: string;
    quickStarts: string;
    requestTokenURL: string;
    inactivityTimeout: number;
    statuspageID: string;
    GOARCH: string;
    GOOS: string;
    graphqlBaseURL: string;
    developerCatalogCategories: string;
    userSettingsLocation: string;
    addPage: string; // JSON encoded configuration
    consolePlugins: string[]; // Console dynamic plugins enabled on the cluster
    i18nNamespaces: string[]; // Available i18n namespaces
    quickStarts: string;
    projectAccessClusterRoles: string;
    clusters: string[];
    controlPlaneTopology: string;
    telemetry: Record<string, string>;
  };
  windowError?: string;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: Function;
  store?: {}; // Redux store
  pluginStore?: {}; // Console plugin store
  loadPluginEntry?: Function;
  Cypress?: {};
}
