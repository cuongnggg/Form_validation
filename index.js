
// Construtor function
function validator(options) {

    //stored Rules
    var selectorRules = {}

    // ---------------------------------
    //trỏ đến element cha để lấy data của element đang đứng
    function getparent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            //gắn thẻ element hiện tại = thẻ cha
            element = element.parentElement
        }
    }
    // ---------------------------------
    //handle validate
    function validate(inputElement, rule) {
        //Lấy ra value: inputElement.value người dùng đã nhập
        //test func: rule.test
        var errorElement = getparent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        //rules sẽ lấy ra những func trong selectorRules thông qua
        //key: rule.selector
        //Lặp qua từng rule & kiểm tra
        //Nếu có lỗi thì dừng
        var rules = selectorRules[rule.selector]
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)

            }
            if (errorMessage) break;
        }


        if (errorMessage) {
            errorElement.innerText = errorMessage
            //Thêm thuộc tính vào class = classList.add
            getparent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getparent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    //Làm việc func với từng form
    var formElement = document.querySelector(options.form)

    if (formElement) {
        //Bỏ đi submit mặc định
        formElement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true;

            //Lặp qua từng rule trong form child để invalid
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })


            if (isFormValid) {
                //submit with javaScript
                if (typeof options.onSubmit === 'function') {
                    //Trả về value khi nhấn submit
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {

                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values
                    }, {});
                    options.onSubmit(formValues)
                }//submit with HTML
                else {
                    //submit với hành động mặc định của html
                    formElement.submit()
                }
            }
        }

        //duyệt phần tử trong array của options -> #fullname/#email
        options.rules.forEach(function (rule) {
            //Lấy element trong rule từ form đã chọn (options.form) 

            //Lưu rule cho mỗi input
            //Nếu selector > 2 thì push rule của selector đó vô list selectorRules
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                //Nếu selector < 2 thì gắn vô mảng[]
                selectorRules[rule.selector] = [rule.test]
            }
            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function (inputElement) {

                //handle input userName
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                //handle input email
                inputElement.oninput = function () {
                    var getParentfunction = getparent(inputElement, options.formGroupSelector);
                    var errorElement = getParentfunction.querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParentfunction.classList.remove('invalid')
                }

            })



        })
    }
}

//Định nghĩa các rule
//Nguyên tắc của rule:
//1. Khi lỗi trả về lỗi
//2. Khi hợp lệ trả về undefined
validator.isRequired = function (selector) {
    //check if userName exist
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : ('Vui lòng nhập trường này')
        }
    }
}

validator.isEmail = (selector) => {
    //check if email is true
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : ('Trường này phải là email')
        }
    }
}
//độ dài tối thiểu khi nhập password
validator.minLength = function (selector, min) {
    //check if userName exist
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : (`Vui lòng nhập ${min} kí tự`)
        }
    }
}

validator.isConfirmed = function (selector, getConfirmValue, message) {
    //check if password confirmated
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || ('Giá trị nhập vào không chính xác')
        }
    }
}