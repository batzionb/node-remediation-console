# OpenShift Node Remediation Console Plugin
The Openshift console plugin for Node Healthcheck and Self Node Remediation

## Local development

1. `yarn build` to build the plugin, generating output to `dist` directory
2. `yarn http-server` to start an HTTP server hosting the generated assets

```
Starting up http-server, serving ./dist
Available on:
  http://127.0.0.1:9001
  http://192.168.1.190:9001
  http://10.40.192.80:9001
Hit CTRL-C to stop the server
```

The server runs on port 9001 with caching disabled and CORS enabled. Additional
[server options](https://github.com/http-party/http-server#available-options) can be passed to
the script, for example:

```sh
yarn http-server -a 127.0.0.1
```

See the plugin development section in
[Console Dynamic Plugins README](/frontend/packages/console-dynamic-plugin-sdk/README.md) for details
on how to run Bridge using local plugins.

## Deployment on cluster

Console dynamic plugins are supposed to be deployed via [OLM operators](https://github.com/operator-framework).
In case of demo plugin, we just apply a minimal OpenShift manifest which adds the necessary resources.

```sh
oc apply -f oc-manifest.yaml
```

Note that the `Service` exposing the HTTP server is annotated to have a signed
[service serving certificate](https://access.redhat.com/documentation/en-us/openshift_container_platform/4.9/html/security_and_compliance/configuring-certificates#add-service-serving)
generated and mounted into the image. This allows us to run the server with HTTP/TLS enabled, using
a trusted CA certificate.

## Enabling the plugin

Once deployed on the cluster, demo plugin must be enabled before it can be loaded by Console.

To enable the plugin manually, edit [Console operator](https://github.com/openshift/console-operator)
config and make sure the plugin's name is listed in the `spec.plugins` sequence (add one if missing):

```sh
oc edit console.operator.openshift.io cluster
```

```yaml
# ...
spec:
  plugins:
    - console-node-remediation-console-plugin
# ...
```
### Local development

In case of local developement of the dynamic plugin, just set up your
HTTP server locally and pass its endpoint address in form of a service proxy 
entry to the console server in form of JSON, using the `--plugin-proxy` flag.


Example:
```
 ./bin/bridge --plugin-proxy='{"services":[{"consoleAPIPath":"/api/proxy/namespace/serviceNamespace/service/serviceName:9991/","endpoint":"http://localhost:8080"}]}'
```

The service proxy entry besides service `endpoint` contain also `consoleAPIPath`, so the console server knows which path is should expose and proxy to service endpoint.
Note that the service `endpoint` needs to contain scheme and `consoleAPIPath` needs to contain trailing slash in order for request to be proxied correctly.

## Docker image

Following commands should be executed in Console repository root.

1. Build the image:
   ```sh
   docker build -f Dockerfile.plugins.demo -t quay.io/$USER/console-demo-plugin .
   ```
2. Run the image:
   ```sh
   docker run -it -p 9001:9001 quay.io/$USER/console-demo-plugin
   ```
3. Push the image to image registry:
   ```sh
   docker push quay.io/$USER/console-demo-plugin
   ```

Update and apply `oc-manifest.yaml` to use a custom plugin image.

