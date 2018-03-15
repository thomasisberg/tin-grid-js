# tin-grid-js
Responsive, dependency free grid system for Javascript

## Installation
```
yarn add tin-grid --save
```
or
```
nmp install tin-grid --save
```
or
```
bower install tin-grid --save
```

```
import TinGrid from 'tin-grid';

TinGrid(document.getElementById('TinGrid'), {
    itemHeightType: "ratio",
    itemHeight: 1,
    useTransition: true
});
```