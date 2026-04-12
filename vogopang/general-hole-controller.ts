/**
 * vogopang_back/vogopang_back_dev/src/services/hole/controllers/general-hole.controller.ts
*/
@Get()
@ApiCommonResponse()



/**
 * Get()
*/
export declare const Get: (path?: string) => MethodDecorator;

declare type MethodDecorator = 
<T>(target: Object, propertyKey: string | 
symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;


interface TypedPropertyDescriptor<T>{
    enumerable?: boolean;
    configurable?: boolean;
    writable?: boolean;
    value?: T;
    get?: () => T;
    set?: (value: T) => void;
}


/**
 * ApiCommonResponse()
*/
export const ApiCommonResponse = <TModel extends Type<any>>(
    model: TModel, type: ResponseType = 'single'
) =>{
    return applyDecorators(
        ApiExtraModels(model),
        ApiOkResponse({
            schema: {
                allOf: [
                    {
                        properties: {
                            data: 
                                type === 'pagination'
                                    ? {
                                        type: 'object',
                                        properties: {
                                            total: {
                                                type: 'number',
                                                example: 10,
                                                descriptions: '데이터 전체 개수',
                                            },
                                            items: {
                                                type: 'array',
                                                items: { 
                                                    $ref: getSchemaPath(model), // 모델 참조
                                                 },
                                            },
                                        },
                                    }
                                    : // [Single 타입일 경우] 
                                    {
                                        $ref: getSchemaPath(model),
                                    },
                        }
                    }
                ]
            }
        })
    )
}:

export declare function applyDecorators(
    ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
): <TFunction extends Function, Y>(
    target: TFunction | object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<Y>
 ) => void;
    


