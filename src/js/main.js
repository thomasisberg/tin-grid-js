import TinGrid from './tin-grid';
import "../sass/main.scss";

TinGrid(document.getElementById('TinGrid'), {
    itemHeightType: "ratio",
    itemHeight: 1,
    useTransition: true
});