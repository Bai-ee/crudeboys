var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/*!
* Copyright (c) Microsoft Corporation.
* Licensed under the MIT License.
*/
var SandDanceEmbed;
(function (SandDanceEmbed) {
    function defaultDependencies(localDev, static, minified) {
        if (localDev === void 0) { localDev = false; }
        if (static === void 0) { static = false; }
        if (minified === void 0) { minified = true; }
        var deps = [
            {
                type: 'stylesheet',
                url: (localDev
                    ? '../../../sanddance-explorer'
                    : 'https://unpkg.com/@msrvida/sanddance-explorer@4') + "/dist/css/sanddance-explorer.css"
            },
            {
                type: 'stylesheet',
                url: (localDev
                    ? '../..'
                    : 'https://unpkg.com/@msrvida/sanddance-embed@4') + "/dist/css/sanddance-embed.css"
            },
            {
                type: 'script',
                url: (localDev
                    ? '../../node_modules/react'
                    : 'https://unpkg.com/react@17') + "/umd/react." + (minified ? 'production.min' : 'development') + ".js"
            },
            {
                type: 'script',
                url: (localDev
                    ? '../../node_modules/react-dom'
                    : 'https://unpkg.com/react-dom@17') + "/umd/react-dom." + (minified ? 'production.min' : 'development') + ".js"
            },
            {
                type: 'script',
                url: (localDev
                    ? '../../node_modules/vega'
                    : 'https://unpkg.com/vega@5.25') + "/build/vega" + (minified ? '.min' : '') + ".js"
            },
            {
                type: 'script',
                url: (localDev
                    ? '../../node_modules/@fluentui/react'
                    : 'https://unpkg.com/@fluentui/react@8') + "/dist/fluentui-react.js"
            },
            {
                type: 'script',
                url: (localDev
                    ? '../../../sanddance-explorer'
                    : 'https://unpkg.com/@msrvida/sanddance-explorer@4') + "/dist/umd/sanddance-explorer.js"
            },
        ];
        if (static) {
            deps.push({
                type: 'script',
                url: (localDev
                    ? '../..'
                    : 'https://unpkg.com/@msrvida/sanddance-embed@4.4') + "/dist/umd/sanddance-embed.js"
            });
        }
        return deps;
    }
    SandDanceEmbed.defaultDependencies = defaultDependencies;
})(SandDanceEmbed || (SandDanceEmbed = {}));
/*!
* Copyright (c) Microsoft Corporation.
* Licensed under the MIT License.
*/
var SandDanceEmbed;
(function (SandDanceEmbed) {
    function getUnloadedDeps(depType, tagType, tagAttr) {
        var depsToLoad = SandDanceEmbed.deps.filter(function (dep) { return dep.type === depType; });
        var elements = __spreadArray(__spreadArray([], Array.from(document.head.querySelectorAll(tagType)), true), Array.from(document.body.querySelectorAll(tagType)), true);
        depsToLoad.forEach(function (dep) {
            var element = elements.find(function (element) { var _a; return ((_a = element.attributes[tagAttr]) === null || _a === void 0 ? void 0 : _a.nodeValue) === dep.url; });
            if (element) {
                dep.existed = true;
                dep.loaded = true;
            }
        });
        return depsToLoad.filter(function (dep) { return !dep.loaded; });
    }
    function loadStyleSheets() {
        var promises = [];
        var deps = getUnloadedDeps('stylesheet', 'link', 'href');
        deps.forEach(function (dep) {
            promises.push(new Promise(function (resolve, reject) {
                var el = document.createElement('link');
                el.rel = 'stylesheet';
                el.type = 'text/css';
                el.href = dep.url;
                el.onload = function () {
                    dep.loaded = true;
                    resolve();
                };
                document.head.appendChild(el);
            }));
        });
        return promises;
    }
    function loadScripts() {
        var deps = getUnloadedDeps('script', 'script', 'src');
        var promise = new Promise(function (resolve, reject) {
            var next = function (index) {
                if (index >= deps.length) {
                    resolve();
                }
                else {
                    var dep_1 = deps[index];
                    var el = document.createElement('script');
                    el.src = dep_1.url;
                    el.onload = function () {
                        dep_1.loaded = true;
                        next(++index);
                    };
                    document.head.appendChild(el);
                }
            };
            next(0);
        });
        return [promise];
    }
    SandDanceEmbed.prepare = new Promise(function (resolve, reject) {
        SandDanceEmbed.deps = SandDanceEmbed.defaultDependencies(SandDanceEmbed.localDev, SandDanceEmbed.static, SandDanceEmbed.minified);
        Promise.all(__spreadArray(__spreadArray([], loadStyleSheets(), true), loadScripts(), true)).then(function () { return resolve(); });
    });
})(SandDanceEmbed || (SandDanceEmbed = {}));
/*!
* Copyright (c) Microsoft Corporation.
* Licensed under the MIT License.
*/
var SandDanceEmbed;
(function (SandDanceEmbed) {
    SandDanceEmbed.requests = [];
    var creating = false;
    var innerLoad;
    function load(data, insight, props, options) {
        return new Promise(function (resolve) {
            innerLoad = function () {
                var getPartialInsight;
                if (insight) {
                    //TODO make sure that insight columns exist in dataset
                    getPartialInsight = function (columns) { return insight; };
                }
                SandDanceEmbed.sandDanceExplorer.load(data, getPartialInsight, options).then(resolve);
            };
            var create = function () {
                creating = true;
                SandDanceEmbed.prepare.then(function () {
                    SandDanceExplorer.use(FluentUIReact, React, ReactDOM, vega);
                    var theme = (props === null || props === void 0 ? void 0 : props.theme) || '';
                    if (theme) {
                        FluentUIReact.loadTheme({ palette: SandDanceExplorer.themePalettes[theme] });
                    }
                    var viewerOptions = getViewerOptions(theme, props === null || props === void 0 ? void 0 : props.viewerOptions);
                    var explorerProps = __assign(__assign({ logoClickUrl: 'https://microsoft.github.io/SandDance/' }, props), { mounted: function (explorer) {
                            SandDanceEmbed.sandDanceExplorer = explorer;
                            creating = false;
                            innerLoad();
                            (props === null || props === void 0 ? void 0 : props.mounted) && props.mounted(explorer);
                        }, viewerOptions: viewerOptions });
                    ReactDOM.render(React.createElement(SandDanceExplorer.Explorer, explorerProps), document.body);
                });
            };
            if (SandDanceEmbed.sandDanceExplorer) {
                innerLoad();
            }
            else if (!creating) {
                create();
            }
        });
    }
    SandDanceEmbed.load = load;
    function getViewerOptions(theme, viewerOptions) {
        return __assign(__assign({}, viewerOptions), { colors: SandDanceExplorer.getColorSettingsFromThemePalette(SandDanceExplorer.themePalettes[theme]), onError: function (errors) {
                var response = {
                    request: null,
                    errors: errors
                };
                SandDanceEmbed.lastRequestWithSource === null || SandDanceEmbed.lastRequestWithSource === void 0 ? void 0 : SandDanceEmbed.lastRequestWithSource.source.postMessage(response, '*');
            }, onCanvasClick: function (e) {
                var request = {
                    action: 'eventCanvasClick'
                };
                var response = {
                    request: request,
                    event: safeSerialize(e)
                };
                SandDanceEmbed.lastRequestWithSource === null || SandDanceEmbed.lastRequestWithSource === void 0 ? void 0 : SandDanceEmbed.lastRequestWithSource.source.postMessage(response, '*');
            }, onCubeClick: function (e, cube) {
                var request = {
                    action: 'eventCubeClick'
                };
                var response = {
                    request: request,
                    event: safeSerialize(e),
                    ordinal: cube.ordinal
                };
                SandDanceEmbed.lastRequestWithSource === null || SandDanceEmbed.lastRequestWithSource === void 0 ? void 0 : SandDanceEmbed.lastRequestWithSource.source.postMessage(response, '*');
            } });
    }
    function safeSerialize(input) {
        var output = {};
        for (var key in input) {
            var value = input[key];
            switch (typeof value) {
                case 'undefined':
                case 'number':
                case 'boolean':
                case 'string':
                    output[key] = value;
            }
        }
        return output;
    }
    function changeColorScheme(darkTheme) {
        var theme = darkTheme ? 'dark-theme' : '';
        FluentUIReact.loadTheme({ palette: SandDanceExplorer.themePalettes[theme] });
        var viewerOptions = getViewerOptions(theme, SandDanceEmbed.sandDanceExplorer.viewerOptions);
        vega.scheme(SandDanceExplorer.SandDance.constants.ColorScaleNone, function () { return viewerOptions.colors.defaultCube; });
        SandDanceEmbed.sandDanceExplorer.updateViewerOptions(viewerOptions);
        SandDanceEmbed.sandDanceExplorer.viewer.renderSameLayout(viewerOptions);
        var props = __assign(__assign({}, SandDanceEmbed.sandDanceExplorer.props), { theme: theme, viewerOptions: viewerOptions });
        ReactDOM.render(React.createElement(SandDanceExplorer.Explorer, props), document.body);
    }
    SandDanceEmbed.changeColorScheme = changeColorScheme;
    function respondToRequest(requestWithSource) {
        SandDanceEmbed.lastRequestWithSource = requestWithSource;
        SandDanceEmbed.requests.push(requestWithSource);
        var copy = __assign({}, requestWithSource);
        delete copy.source;
        var request = __assign({}, copy);
        var response;
        switch (request.action) {
            case 'init': {
                response = {
                    request: request
                };
                break;
            }
            case 'load': {
                var request_load = request;
                load(request_load.data, request_load.insight, request_load.props, request_load.options).then(function () {
                    response = {
                        request: request
                    };
                    requestWithSource.source.postMessage(response, '*');
                });
                //don't keep a copy of the array
                delete request_load.data;
                break;
            }
            case 'getData': {
                response = {
                    request: request,
                    data: SandDanceEmbed.sandDanceExplorer.state.dataContent.data
                };
                break;
            }
            case 'getInsight': {
                response = {
                    request: request,
                    insight: SandDanceEmbed.sandDanceExplorer.getInsight()
                };
                break;
            }
            case 'getSetup': {
                var setup = SandDanceEmbed.sandDanceExplorer.getSetup();
                setup.camera = SandDanceEmbed.sandDanceExplorer.viewer.getCamera();
                response = {
                    request: request,
                    setup: setup
                };
                break;
            }
            case 'theme': {
                var request_theme = request;
                if (request_theme.dark !== undefined) {
                    changeColorScheme(request_theme.dark);
                }
                response = {
                    request: request,
                    theme: SandDanceEmbed.sandDanceExplorer.props.theme
                };
            }
        }
        SandDanceEmbed.prepare.then(function () {
            if (response) {
                requestWithSource.source.postMessage(response, '*');
            }
        });
    }
    SandDanceEmbed.respondToRequest = respondToRequest;
    window.addEventListener('message', function (e) {
        var payload = e.data;
        if (!payload)
            return;
        if (Array.isArray(payload)) {
            var data = payload;
            var requestLoadFromArray = {
                action: 'load',
                data: data,
                insight: null
            };
            payload = requestLoadFromArray;
        }
        else {
            var dataWithInsight = payload;
            if (Array.isArray(dataWithInsight.data)) {
                var requestLoadFromDataWithInsight = __assign({ action: 'load' }, dataWithInsight);
                payload = requestLoadFromDataWithInsight;
            }
        }
        var request = payload;
        if (!request)
            return;
        var requestWithSource = __assign(__assign({}, request), { source: e.source });
        respondToRequest(requestWithSource);
    });
    if (window.opener) {
        var request = {
            action: 'init',
            ts: new Date()
        };
        respondToRequest(__assign(__assign({}, request), { source: window.opener }));
    }
})(SandDanceEmbed || (SandDanceEmbed = {}));
