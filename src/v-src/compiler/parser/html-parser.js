/**
 * html parser
 */

import { makeMap, no } from '../../shared/util'
import { isNonPhrasingTag } from 'web/compiler/util';
import { unicodeRegExp } from 'core/util/lang';
// import { ASTAttr, CompilerOptions } from 'types/compiler'