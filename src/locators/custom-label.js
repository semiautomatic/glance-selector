import isDescendant from '../utils/is-descendant';

export default function(label, container, customLabels) {
    customLabels = customLabels || {};
    let resolver = customLabels[label];

    let elements = resolver;
    if (typeof(elements) == 'function') {
        elements = resolver();
    }

    if (!elements) return [];

    if (elements.locate) {
        elements = resolver.locate();
    }

    elements = [].concat(elements);
    let r = [];

    try {
        elements.forEach(function(e) {
            if (isDescendant(container, e)) {
                r.push(e)
            }
        });

        return r;
    }
    catch (e) {
        return [];
    }
}