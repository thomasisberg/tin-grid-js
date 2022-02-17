# tin-grid-js
Responsive, dependency free grid system for Javascript

## Installation options
```
yarn add tin-grid --save
```
```
nmp install tin-grid --save
```
```
bower install tin-grid --save
```

## Usage

### As a module

```
import TinGrid from 'tin-grid';

TinGrid(document.getElementById('TinGrid'), {
    itemHeightType: "ratio",
    itemHeight: 1,
    useTransition: true
});
```

### Script tag
You can choose to load the script separately, or implement the script in your pre processor any way you like.
```
<script src="node_modules/tin-slide.js"></script>
```

