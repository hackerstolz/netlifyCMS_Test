import CMS from "netlify-cms"
import { UuidControl, UuidPreview } from 'netlify-cms-widget-uuid'

CMS.registerWidget('uuid', UuidControl, UuidPreview)