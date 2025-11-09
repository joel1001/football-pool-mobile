import React, { useMemo, useState, useRef, useEffect } from "react";
import { View, Dimensions, Image, Text, ActivityIndicator, Modal } from "react-native";
import Svg, { Path } from "react-native-svg";
import { styles } from "./login.styles";
import { Input } from "@/atomic/atoms/input/input";
import Label from "@/atomic/atoms/label/label";
import Button from "@/atomic/atoms/button/button";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { loginService, signUpService, forgotPasswordService, resetPasswordService, socialAuthService } from "@/services/auth/auth-service";
import { useAppContext } from "@/context/app-context";
import { useFacebookAuth } from "@/services/auth/facebook-auth";
import { Dropdown } from "@/atomic/atoms/dropdown/dropdown";
import PhoneInput from "react-native-phone-number-input";
import { Country, State, City } from 'country-state-city';
import footballData from '@/context/mocks/football-data.json';


const { width } = Dimensions.get("window");

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birth, setBirth] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [enableError, setEnableError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<"signIn" | "signUp" | "forgot">("signIn");
  const [signUpPage, setSignUpPage] = useState(0);
  const [preferredTeams, setPreferredTeams] = useState<string[]>([]);
  const [preferredLeagues, setPreferredLeagues] = useState<string[]>([]);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);
  const { setLocalData } = useAppContext();
  
  // Facebook Auth
  const { request, response, promptAsync } = useFacebookAuth();
  
  // Password visibility icons
  const passwordIcons = {
    displayPasswordIcon: <Ionicons name="eye-outline" size={20} color="#666" />,
    hidePasswordIcon: <Ionicons name="eye-off-outline" size={20} color="#666" />
  };
  
  // Handle Facebook auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleFacebookLogin(access_token);
    }
  }, [response]);
  
  // Password validation requirements
  const passwordRequirements = useMemo(() => {
    const passwordToValidate = currentView === "forgot" ? newPassword : password;
    return {
      hasUpperCase: /[A-Z]/.test(passwordToValidate),
      hasNumber: /[0-9]/.test(passwordToValidate),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(passwordToValidate),
      hasValidLength: passwordToValidate.length >= 8 && passwordToValidate.length <= 12,
      meetsAll: function() {
        return this.hasUpperCase && this.hasNumber && this.hasSpecialChar && this.hasValidLength;
      }
    };
  }, [password, newPassword, currentView]);
  
  // Email validation
  const isValidEmail = useMemo(() => {
    if (!email) return true; // Don't show error if empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);
  
  // Get countries, states, and cities data
  const countries = useMemo(() => Country.getAllCountries().map(c => ({ 
    label: c.name, 
    value: c.isoCode,
    flag: c.flag
  })), []);
  const states = useMemo(() => {
    if (!country) return [];
    return State.getStatesOfCountry(country).map(s => ({ label: s.name, value: s.isoCode }));
  }, [country]);
  const cities = useMemo(() => {
    if (!country || !state) return [];
    return City.getCitiesOfState(country, state).map(c => ({ label: c.name, value: c.name }));
  }, [country, state]);
  
  // Get football leagues and teams data
  const availableLeagues = useMemo(() => footballData.leagues.map(l => l.name), []);
  const availableTeams = useMemo(() => {
    if (preferredLeagues.length === 0) return [];
    
    // Find league IDs from selected league names
    const selectedLeagueIds = footballData.leagues
      .filter(l => preferredLeagues.includes(l.name))
      .map(l => l.id);
    
    // Filter teams that belong to selected leagues
    return footballData.teams
      .filter(t => selectedLeagueIds.includes(t.league))
      .map(t => t.name);
  }, [preferredLeagues]);

  const totalSignUpPages = 4;

  const isSignInFormComplete = useMemo(() => {
    if (currentView === "signIn") {
      return email && password && isValidEmail;
    }
    if (currentView === "forgot") {
      if (!forgotEmailSent) {
        return email && isValidEmail;
      } else {
        return email && isValidEmail && verificationCode && confirmPassword && newPassword && 
               passwordRequirements.meetsAll() && confirmPassword === newPassword;
      }
    }
    return true;
  }, [currentView, email, password, forgotEmailSent, verificationCode, confirmPassword, newPassword, isValidEmail, passwordRequirements]);

  const isSignUpFormComplete = useMemo(() => {
    if (currentView !== "signUp") return true;
    
    // Validar solo campos requeridos (los opcionales: country, state, city, phone, zipcode)
    const requiredFieldsComplete = email && isValidEmail && password && confirmPassword && 
                                    password === confirmPassword && passwordRequirements.meetsAll() &&
                                    name && lastName && birth && 
                                    preferredTeams.length > 0 && preferredLeagues.length > 0;
    
    // El formulario está completo cuando estamos en la última página y todos los campos requeridos están llenos
    return signUpPage === totalSignUpPages - 1 && requiredFieldsComplete;
  }, [email, password, confirmPassword, name, lastName, birth, preferredTeams, preferredLeagues, signUpPage, currentView, isValidEmail, passwordRequirements]);

  const inputsPerView = useMemo(() => [
    // Page 0: Basic Info (Inputs only)
    { placeholder: "Email", allowedToViews: ["signIn", "signUp", "forgot"], value: email, onChangeText: setEmail, display: currentView !== "signUp" || signUpPage === 0, page: 0, inputType: 'email' },
    { placeholder: "Password", allowedToViews: ["signIn", "signUp"], value: password, onChangeText: setPassword, secureTextEntry: true, display: currentView !== "signUp" || signUpPage === 0, page: 0 },
    { placeholder: "Verification Code", allowedToViews: ["forgot"], value: verificationCode, onChangeText: setVerificationCode, display: forgotEmailSent, page: 0 },
    { placeholder: "New Password", allowedToViews: ["forgot"], value: newPassword, onChangeText: setNewPassword, secureTextEntry: true, display: forgotEmailSent, page: 0 },
    { placeholder: "Confirm Password", allowedToViews: ["signUp", "forgot"], value: confirmPassword, onChangeText: setConfirmPassword, secureTextEntry: true, display: (currentView === "signUp" && signUpPage === 0) || forgotEmailSent, page: 0 },
    { placeholder: "Name", allowedToViews: ["signUp"], value: name, onChangeText: setName, display: signUpPage === 0, page: 0 },
    
    // Page 1: Personal Info (Inputs only)
    { placeholder: "Last Name", allowedToViews: ["signUp"], value: lastName, onChangeText: setLastName, display: signUpPage === 1, page: 1 },
    { placeholder: "Phone", allowedToViews: ["signUp"], value: phone, onChangeText: setPhone, display: signUpPage === 1, page: 1, inputType: 'phoneInput' },
    { placeholder: "Birth", allowedToViews: ["signUp"], value: birth, onChangeText: setBirth, display: signUpPage === 1, page: 1 },
    { placeholder: "Zipcode", allowedToViews: ["signUp"], value: zipcode, onChangeText: setZipcode, display: signUpPage === 1, page: 1 },
    
    // Page 2: Location Dropdowns
    { placeholder: "Country", allowedToViews: ["signUp"], value: country, onChangeText: setCountry, display: signUpPage === 2, page: 2, inputType: 'countryPicker', options: countries },
    { placeholder: "State", allowedToViews: ["signUp"], value: state, onChangeText: setState, display: signUpPage === 2, page: 2, inputType: 'statePicker', options: states },
    { placeholder: "City", allowedToViews: ["signUp"], value: city, onChangeText: setCity, display: signUpPage === 2, page: 2, inputType: 'cityPicker', options: cities },
    
    // Page 3: Preferences Dropdowns - Leagues first, then Teams
    { placeholder: "Preferred Leagues", allowedToViews: ["signUp"], value: preferredLeagues, onChangeText: setPreferredLeagues, display: signUpPage === 3, page: 3, inputType: 'leaguesPicker', options: availableLeagues },
    { placeholder: "Preferred Teams", allowedToViews: ["signUp"], value: preferredTeams, onChangeText: setPreferredTeams, display: signUpPage === 3 && preferredLeagues.length > 0, page: 3, inputType: 'teamsPicker', options: availableTeams },
  ], [email, password, confirmPassword, name, lastName, country, state, city, phone, zipcode, birth, preferredTeams, preferredLeagues, newPassword, verificationCode, forgotEmailSent, signUpPage, currentView, countries, states, cities, availableLeagues, availableTeams]);

  const handleFacebookLogin = async (accessToken: string) => {
    setIsLoading(true);
    setEnableError(false);
    setErrorMessage("");
    
    try {
      const userInfo = await socialAuthService({
        accessToken,
        provider: 'facebook'
      });
      
      if (userInfo) {
        setLocalData({ 
          isAuthenticated: true, 
          username: userInfo.name, 
          token: userInfo.accessToken 
        });
      } else {
        setEnableError(true);
        setErrorMessage("Facebook authentication failed");
      }
    } catch (error: any) {
      setEnableError(true);
      console.warn("❌ Facebook auth error:", error);
      console.warn("❌ Error response:", error.response?.data);
      
      if (error.response) {
        setErrorMessage(error.response.data?.error || "Facebook authentication failed");
      } else {
        setErrorMessage("Cannot connect to server. Check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setEnableError(false);
    setErrorMessage("");
    setIsLoading(true);
    
    try {
      if (currentView === "signIn") {
        // Sign In flow
        if (!email || !password) {
          setEnableError(true);
          setIsLoading(false);
          return;
        }
        const userInfo = await loginService({ email: email.toLowerCase(), password });
        if (userInfo) {
          setLocalData({ isAuthenticated: true, username: userInfo.name, token: userInfo.accessToken });
        } else {
          setEnableError(true);
        }
        setIsLoading(false);
      } else if (currentView === "signUp") {
        // Sign Up flow
        if (!isSignUpFormComplete) {
          setEnableError(true);
          setIsLoading(false);
          return;
        }
        
        const signUpData = {
          email: email.toLowerCase(),
          password,
          confirmPassword,
          name,
          lastName,
          birth,
          country,
          state,
          city,
          phone,
          zipcode,
          preferredTeams,
          preferredLeagues,
        };
                
        const userInfo = await signUpService(signUpData);
        if (userInfo) {
          setLocalData({ isAuthenticated: true, username: userInfo.name, token: userInfo.accessToken });
        } else {
          setEnableError(true);
        }
        setIsLoading(false);
      } else if (currentView === "forgot") {
        // Forgot Password flow
        if (!forgotEmailSent) {
          // Step 1: Send email
          if (!email) {
            setEnableError(true);
            setErrorMessage("Please enter your email address");
            setIsLoading(false);
            return;
          }
          
          // Call forgot password API
          const response = await forgotPasswordService({ email: email.toLowerCase() });
          if (response.success) {
            setForgotEmailSent(true);
            setEnableError(false);
            setErrorMessage("");
          } else {
            setEnableError(true);
            setErrorMessage("Failed to send password reset email");
          }
          setIsLoading(false);
        } else {
          // Step 2: Reset password
          if (!email || !verificationCode || !newPassword || !confirmPassword) {
            setEnableError(true);
            setErrorMessage("Please fill all required fields");
            setIsLoading(false);
            return;
          }
          
          if (newPassword !== confirmPassword) {
            setEnableError(true);
            setErrorMessage("Passwords do not match");
            setIsLoading(false);
            return;
          }
          
          if (!passwordRequirements.meetsAll()) {
            setEnableError(true);
            setErrorMessage("Password does not meet requirements");
            setIsLoading(false);
            return;
          }
          
          // Call reset password API with verification code and new password
          const resetPasswordData = {
            email: email.toLowerCase(),
            code: verificationCode,
            newPassword,
            confirmPassword
          };          
          const resetResponse = await resetPasswordService(resetPasswordData);
          
          if (resetResponse.success) {
            // Reset successful, now login with new credentials
            const userInfo = await loginService({ 
              email: email.toLowerCase(), 
              password: newPassword 
            });
            
            if (userInfo) {
              setLocalData({ 
                isAuthenticated: true, 
                username: userInfo.name, 
                token: userInfo.accessToken 
              });
              // Clear forgot password state
              setForgotEmailSent(false);
              setVerificationCode("");
              setNewPassword("");
              setConfirmPassword("");
              setEmail("");
            } else {
              setEnableError(true);
              setErrorMessage("Password reset successful, but login failed. Please try signing in.");
            }
          } else {
            setEnableError(true);
            setErrorMessage("Failed to reset password. Please check your verification code.");
          }
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      setEnableError(true);
      setIsLoading(false);
      console.warn("❌ Authentication error:", error);
      console.warn("❌ Error response:", error.response?.data);
      console.warn("❌ Error status:", error.response?.status);
      console.warn("❌ Error message:", error.message);
      
      // Set user-friendly error messages based on status code
      if (error.response) {
        switch (error.response.status) {
          case 409:
            setErrorMessage("This email is already registered. Try signing in.");
            break;
          case 400:
            setErrorMessage(error.response.data?.error || "Invalid data. Please check your inputs.");
            break;
          case 401:
            setErrorMessage("Incorrect email or password.");
            break;
          case 500:
            setErrorMessage("Server error. Please try again later.");
            break;
          default:
            setErrorMessage("An error occurred. Please try again.");
        }
      } else if (error.request) {
        setErrorMessage("Cannot connect to server. Check your connection.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require("@/assets/images/soccer-ball.jpeg")}
          style={styles.topLeftImage}
        />
      </View>

      <Svg
        height="100%"
        width={width}
        style={styles.waveContainer}
        viewBox={`0 0 ${width} 80`}
      >
        <Path
          d={`M0,40 Q${width * 0.25},110 ${width * 0.6},-30 Q${
            width * 0.75
          },-90 ${width},-20 L${width},120 L0,120 Z`}
          fill="#F5F2EC"
        />
      </Svg>
      <View
        style={[
          styles.inputWrapper,
          currentView === "signUp"
            ? { top: "46%" }
            : currentView === "forgot"
            ? { top: "47%" }
            : { top: "49%" },
        ]}
      >
        {currentView === "forgot" && (
          <View style={styles.backToSignIn}>
            <MaterialIcons
              onPress={() => {
                setCurrentView("signIn");
                setForgotEmailSent(false);
                setVerificationCode("");
                setNewPassword("");
                setConfirmPassword("");
                setEnableError(false);
                setErrorMessage("");
              }}
              name="arrow-back"
              size={20}
              color="#1A4D3A"
            />
            <Text
              onPress={() => {
                setCurrentView("signIn");
                setForgotEmailSent(false);
                setVerificationCode("");
                setNewPassword("");
                setConfirmPassword("");
                setEnableError(false);
                setErrorMessage("");
              }}
              style={styles.backIcon}
            >
              Back
            </Text>
          </View>
        )}
        
        {currentView === "signUp" && (
          <View style={styles.backToSignIn}>
            <MaterialIcons
              onPress={() => {
                if (signUpPage > 0) {
                  setSignUpPage(signUpPage - 1);
                } else {
                  setCurrentView("signIn");
                  setSignUpPage(0);
                }
              }}
              name="chevron-left"
              size={24}
              color="#1A4D3A"
            />
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {Array.from({ length: totalSignUpPages }).map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: signUpPage === index ? "#1A4D3A" : "#CCC"
                  }}
                />
              ))}
            </View>
            <MaterialIcons
              onPress={() => signUpPage < totalSignUpPages - 1 && setSignUpPage(signUpPage + 1)}
              name="chevron-right"
              size={24}
              color={signUpPage === totalSignUpPages - 1 ? "#CCC" : "#1A4D3A"}
              style={{ opacity: signUpPage === totalSignUpPages - 1 ? 0.3 : 1 }}
            />
          </View>
        )}
        {inputsPerView
          .filter((input) => input.allowedToViews.includes(currentView))
          .map((input, i) => {
            const displayedInputs = inputsPerView.filter(inp => inp.allowedToViews.includes(currentView) && inp.display);
            const currentIndex = displayedInputs.findIndex(inp => inp.placeholder === input.placeholder);
            const inputConfig = input as any;
            
            // Phone Input
            if (input.display && inputConfig.inputType === 'phoneInput') {
              return (
                <View key={i} style={{ marginTop: currentIndex === 0 ? 0 : 10, marginBottom: 10, width: 270, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{
                    width: 270,
                    height: 40,
                    backgroundColor: '#E2E6E4',
                    borderRadius: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    borderWidth: 1,
                    borderColor: '#B8BCB8',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <PhoneInput
                      ref={phoneInput}
                      defaultValue={input.value as string}
                      defaultCode="US"
                      layout="second"
                      onChangeFormattedText={(text) => {
                        (input.onChangeText as (value: string) => void)(text);
                      }}
                      containerStyle={{
                        width: 270,
                        height: 40,
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        paddingHorizontal: 0,
                      }}
                      textContainerStyle={{
                        backgroundColor: 'transparent',
                        paddingVertical: 0,
                        height: 38,
                        paddingRight: 8,
                      }}
                      codeTextStyle={{
                        height: 38,
                        fontSize: 14,
                        lineHeight: 38,
                      }}
                      textInputStyle={{
                        height: 38,
                        fontSize: 14,
                        paddingLeft: 8,
                      }}
                      flagButtonStyle={{
                        backgroundColor: 'transparent',
                        width: 60,
                        height: 38,
                      }}
                      countryPickerButtonStyle={{
                        width: 60,
                        height: 38,
                      }}
                      placeholder={input.placeholder}
                    />
                  </View>
                </View>
              );
            }
            
            // Country/State/City Pickers
            if (input.display && ['countryPicker', 'statePicker', 'cityPicker'].includes(inputConfig.inputType)) {
              const options = inputConfig.options || [];
              // Get display label and flag for selected value
              const selectedOption = options.find((opt: any) => opt.value === input.value);
              const selectedLabel = selectedOption?.label || '';
              const selectedFlag = selectedOption?.flag || '';
              
              // Determine placeholder based on type and availability
              let placeholderText = input.placeholder;
              if (inputConfig.inputType === 'statePicker' && !country) {
                placeholderText = 'Select country first';
              } else if (inputConfig.inputType === 'cityPicker' && !state) {
                placeholderText = 'Select state first';
              } else if (inputConfig.inputType === 'cityPicker' && !country) {
                placeholderText = 'Select country first';
              }
              
              // For country picker, pass objects with flags; for others, just labels
              const items = options.length > 0 
                ? (inputConfig.inputType === 'countryPicker' 
                    ? options.map((opt: any) => ({ label: opt.label, icon: opt.flag }))
                    : options.map((opt: any) => opt.label))
                : ['No options available'];
              
              // zIndex based on picker type (country highest, city lowest)
              const zIndexValue = inputConfig.inputType === 'countryPicker' ? 103 :
                                  inputConfig.inputType === 'statePicker' ? 102 : 101;
              
              return (
                <View key={i} style={{ 
                  marginTop: currentIndex === 0 ? 0 : 10, 
                  zIndex: zIndexValue,
                  elevation: zIndexValue,
                }}>
                  <Dropdown
                    items={items}
                    placeholder={placeholderText}
                    singleOption={true}
                    value={selectedLabel}
                    icon={inputConfig.inputType === 'countryPicker' ? selectedFlag : undefined}
                    onChange={(values) => {
                      if (values.length > 0 && options.length > 0 && values[0] !== 'No options available') {
                        // Find the isoCode for the selected label
                        const selectedOption = options.find((opt: any) => opt.label === values[0]);
                        if (selectedOption) {
                          (input.onChangeText as (value: string) => void)(selectedOption.value);
                        }
                        // Reset dependent fields
                        if (inputConfig.inputType === 'countryPicker') {
                          setState("");
                          setCity("");
                        } else if (inputConfig.inputType === 'statePicker') {
                          setCity("");
                        }
                      }
                    }}
                  />
                </View>
              );
            }
            
            // Regular Input
            if (input.display && !Array.isArray(input.value)) {
              return (
                <Input
                  key={i}
                  placeholder={input.placeholder}
                  value={input.value}
                  onChangeText={input.onChangeText as (value: string) => void}
                  type={input.secureTextEntry ? "password" : "text"}
                  passwordIcons={input.secureTextEntry ? passwordIcons : undefined}
                  keyboardType={
                    inputConfig.inputType === 'email' ? 'email-address' : 'default'
                  }
                  style={{ marginTop: currentIndex === 0 ? 0 : 10 }}
                />
              );
            }
            
            // Leagues/Teams Pickers with mock data
            if (input.display && ['leaguesPicker', 'teamsPicker'].includes(inputConfig.inputType)) {
              const options = inputConfig.options || [];
              const isLeagues = inputConfig.inputType === 'leaguesPicker';
              return (
                <View key={i} style={{ 
                  marginTop: currentIndex === 0 ? 0 : 10,
                  zIndex: isLeagues ? 105 : 104,
                  elevation: isLeagues ? 105 : 104,
                }}>
                  <Dropdown
                    items={options}
                    placeholder={input.placeholder}
                    singleOption={false}
                    selectedValues={input.value as string[]}
                    onChange={(values) => {
                      (input.onChangeText as (values: string[]) => void)(values);
                      // Clear teams when leagues change
                      if (inputConfig.inputType === 'leaguesPicker') {
                        setPreferredTeams([]);
                      }
                    }}
                  />
                </View>
              );
            }
            
            // Array Dropdowns (fallback for other multiple selections) - Multiple selection with pills
            if (input.display && Array.isArray(input.value)) {
              return (
                <View key={i} style={{ marginTop: currentIndex === 0 ? 0 : 10 }}>
                  <Dropdown
                    items={input.value}
                    placeholder={input.placeholder}
                    singleOption={false}
                    onChange={input.onChangeText as (values: string[]) => void}
                  />
                </View>
              );
            }
            
            return null;
          })}

        {/* Email validation indicator */}
        {email && !isValidEmail && (
          <View style={{ width: 270, marginTop: 8, alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="error" size={14} color="#FF0000" />
              <Text style={{ fontSize: 11, marginLeft: 4, color: '#FF0000' }}>
                Please enter a valid email address
              </Text>
            </View>
          </View>
        )}

        {/* Password Requirements Checklist */}
        {((currentView === "signUp" && signUpPage === 0 && password) || 
          (currentView === "forgot" && forgotEmailSent && newPassword)) && (
          <View style={{ 
            width: 270, 
            marginTop: 12, 
            backgroundColor: '#f9f9f9', 
            borderRadius: 8, 
            padding: 12,
            borderWidth: 1,
            borderColor: '#ddd'
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#333' }}>
              Password Requirements:
            </Text>
            
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons 
                  name={passwordRequirements.hasUpperCase ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={passwordRequirements.hasUpperCase ? "#1A4D3A" : "#999"} 
                />
                <Text style={{ 
                  fontSize: 11, 
                  marginLeft: 6, 
                  color: passwordRequirements.hasUpperCase ? "#1A4D3A" : "#666"
                }}>
                  At least one uppercase letter
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons 
                  name={passwordRequirements.hasNumber ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={passwordRequirements.hasNumber ? "#1A4D3A" : "#999"} 
                />
                <Text style={{ 
                  fontSize: 11, 
                  marginLeft: 6, 
                  color: passwordRequirements.hasNumber ? "#1A4D3A" : "#666"
                }}>
                  At least one number
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons 
                  name={passwordRequirements.hasSpecialChar ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={passwordRequirements.hasSpecialChar ? "#1A4D3A" : "#999"} 
                />
                <Text style={{ 
                  fontSize: 11, 
                  marginLeft: 6, 
                  color: passwordRequirements.hasSpecialChar ? "#1A4D3A" : "#666"
                }}>
                  At least one special character (!@#$%^&*...)
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons 
                  name={passwordRequirements.hasValidLength ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={passwordRequirements.hasValidLength ? "#1A4D3A" : "#999"} 
                />
                <Text style={{ 
                  fontSize: 11, 
                  marginLeft: 6, 
                  color: passwordRequirements.hasValidLength ? "#1A4D3A" : "#666"
                }}>
                  Between 8 and 12 characters
                </Text>
              </View>
              
              {/* Password Match Indicator (only for Sign Up and Forgot Password) */}
              {confirmPassword && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <MaterialIcons 
                    name={
                      currentView === "signUp" 
                        ? (password === confirmPassword ? "check-circle" : "cancel")
                        : (newPassword === confirmPassword ? "check-circle" : "cancel")
                    }
                    size={16} 
                    color={
                      currentView === "signUp"
                        ? (password === confirmPassword ? "#1A4D3A" : "#FF0000")
                        : (newPassword === confirmPassword ? "#1A4D3A" : "#FF0000")
                    }
                  />
                  <Text style={{ 
                    fontSize: 11, 
                    marginLeft: 6, 
                    color: currentView === "signUp"
                      ? (password === confirmPassword ? "#1A4D3A" : "#FF0000")
                      : (newPassword === confirmPassword ? "#1A4D3A" : "#FF0000")
                  }}>
                    {currentView === "signUp"
                      ? (password === confirmPassword ? "Passwords match" : "Passwords don't match")
                      : (newPassword === confirmPassword ? "Passwords match" : "Passwords don't match")
                    }
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {currentView === "signIn" && (
          <View style={styles.controlsBox}>
            <Label
              text="Sign up"
              size="medium"
              color="#333"
              weight="600"
              width="25%"
              onPress={() => {
                setCurrentView("signUp");
                setSignUpPage(0);
              }}
            />
            <Label
              text="Forgot your password?"
              size="medium"
              color="#0A66C2"
              weight="600"
              width="65%"
              onPress={() => setCurrentView("forgot")}
            />
          </View>
        )}

        {(currentView === "signIn" || currentView === "forgot" || (currentView === "signUp" && signUpPage === totalSignUpPages - 1)) && (
          <Button
            title={
              currentView === "signIn" 
                ? "Sign In"
                : currentView === "forgot"
                ? (forgotEmailSent ? "Reset Password" : "Send Reset Email")
                : "Sign Up"
            }
            onPress={handleSubmit}
            backgroundColor="#1A4D3A"
            width={270}
            style={{ marginTop: 16, borderRadius: 4 }}
            disabled={
              isLoading || (
                currentView === "signUp" 
                  ? !isSignUpFormComplete 
                  : !isSignInFormComplete
              )
            }
          />
        )}
        {enableError && (
          <View style={{ width: 270, marginTop: 8, alignItems: "center" }}>
            <Label
              text={errorMessage || "Please fill all required fields"}
              size="medium"
              color="#FF0000"
              weight="600"
            />
          </View>
        )}
        <View style={styles.ssoBox}>
          {currentView === "signIn" && (
            <>
              <Label
                text="Sign up with:"
                size="medium"
                color="#333"
                weight="600"
                width="50%"
              />
              <View style={styles.socialMedia}>
                <FontAwesome
                  style={styles.badge}
                  name="facebook"
                  size={32}
                  color="#1A4D3A"
                  onPress={() => {
                    if (request) {
                      promptAsync();
                    }
                  }}
                />
                <MaterialCommunityIcons
                  name="gmail"
                  size={32}
                  color="#1A4D3A"
                />
              </View>
            </>
          )}
        </View>
      </View>

      {/* Loading Spinner Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 30,
            borderRadius: 10,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
            <ActivityIndicator size="large" color="#1A4D3A" />
            <Text style={{ marginTop: 15, fontSize: 16, color: '#333' }}>
              Loading...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};