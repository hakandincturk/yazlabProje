import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Checkbox, Dialog, Portal } from "react-native-paper";

import DocumentPicker from "react-native-document-picker";

import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import { useNavigation, useRoute } from "@react-navigation/core";
import { Icon } from "react-native-elements";

import getPath from "@flyerhq/react-native-android-uri-path";


const HorizontalAppealScreen = () => {
  const [fileX, setFileX] = useState([{ name: null, uri: null }]);
  const [fileY, setFileY] = useState([{ name: null, uri: null }]);
  const [fileZ, setFileZ] = useState([{ name: null, uri: null }]);
  const [fileQ, setFileQ] = useState([{ name: null, uri: null }]);
  const [isUploadedFileX, setIsUploadedFileX] = useState([{ name: null, uri: null }]);
  const [isUploadedFileY, setIsUploadedFileY] = useState([{ name: null, uri: null }]);
  const [isUploadedFileZ, setIsUploadedFileZ] = useState([{ name: null, uri: null }]);
  const [isUploadedFileQ, setIsUploadedFileQ] = useState([{ name: null, uri: null }]);
  const [fileUploadedLoader, setFileUploadedLoader] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [fileXisLoading, setFileXisLoading] = useState(false);
  const [fileYisLoading, setFileYisLoading] = useState(false);
  const [fileZisLoading, setFileZisLoading] = useState(false);
  const [fileQisLoading, setFileQisLoading] = useState(false);

  const [checked, setChecked] = useState(false);
  const [lastAcceptTermsAndConditions, setLastAcceptTermsAndConditions] = useState(false);
  const [percentCounter, setPercentCounter] = useState(0);
  const [userData, setUserData] = useState(null);
  const [appealUUID, setAppealUUID] = useState(useRoute().params?.appealUUID);
  const navigation = useNavigation();

  useEffect(() => {

    firestore().collection("users")
      .doc(auth().currentUser.uid)
      .get()
      .then(querySnapshot => {
        setUserData(querySnapshot.data());
      });
  }, []);

  useEffect(() => {
    firestore().collection("users")
      .doc(auth().currentUser.uid)
      .collection("appeals")
      .doc(appealUUID)
      .get()
      .then(querySnapshot => {
        console.log(querySnapshot.data()?.appealUUID);
        if (querySnapshot.exists) {
          if (querySnapshot.data()?.files.fileX) {
            setPercentCounter(percentCounter + 1);
            setFileX([{ name: querySnapshot.data()?.files?.fileX }]);
            setIsUploadedFileX([{ name: querySnapshot.data()?.files?.fileX }]);
          }
          if (querySnapshot.data()?.files.fileY) {
            setPercentCounter(percentCounter + 1);
            setFileY([{ name: querySnapshot.data()?.files?.fileY }]);
            setIsUploadedFileY([{ name: querySnapshot.data()?.files?.fileY }]);
          }
          if (querySnapshot.data()?.files.fileZ) {
            setPercentCounter(percentCounter + 1);
            setFileZ([{ name: querySnapshot.data()?.files?.fileZ }]);
            setIsUploadedFileZ([{ name: querySnapshot.data()?.files?.fileZ }]);
          }
          if (querySnapshot.data()?.files.fileQ) {
            setPercentCounter(percentCounter + 1);
            setFileQ([{ name: querySnapshot.data()?.files?.fileQ }]);
            setIsUploadedFileQ([{ name: querySnapshot.data()?.files?.fileQ }]);
          }
        }
      });
  }, []);


  const docPicker = async (type) => {
    if (type === "x") setFileY([{}]);
    else if (type === "y") setFileY([{}]);
    else if (type === "z") setFileZ([{}]);
    else if (type === "q") setFileQ([{}]);

    // Pick a single file
    try {
      const res = await DocumentPicker.pick({
        /*by using allFiles type, you will able to pick any type of media from user device,
        There can me more options as well
        DocumentPicker.types.images: All image types
        DocumentPicker.types.plainText: Plain text files
        DocumentPicker.types.audio: All audio types
        DocumentPicker.types.pdf: PDF documents
        DocumentPicker.types.zip: Zip files
        DocumentPicker.types.csv: Csv files
        DocumentPicker.types.doc: doc files
        DocumentPicker.types.docx: docx files
        DocumentPicker.types.ppt: ppt files
        DocumentPicker.types.pptx: pptx files
        DocumentPicker.types.xls: xls files
        DocumentPicker.types.xlsx: xlsx files
        For selecting more more than one options use the
        type: [DocumentPicker.types.csv,DocumentPicker.types.xls]*/
        type: [DocumentPicker.types.allFiles],
      });

      if (type === "x") setFileX([{ name: res[0].name, uri: res[0].uri }]);
      else if (type === "y") setFileY([{ name: res[0].name, uri: res[0].uri }]);
      else if (type === "z") setFileZ([{ name: res[0].name, uri: res[0].uri }]);
      else if (type === "q") setFileQ([{ name: res[0].name, uri: res[0].uri }]);
      else if (type === "f") setFileF([{ name: res[0].name, uri: res[0].uri }]);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("error -----", err);
      } else {
        throw err;
      }
    }
  };

  const uploadFile = async (type) => {
    let file;

    if (type === "x") file = fileX[0];
    else if (type === "y") file = fileY[0];
    else if (type === "z") file = fileZ[0];
    else if (type === "q") file = fileQ[0];

    let fileName = file.name;
    const fileUri = getPath(file.uri);
    const extension = fileName.split(".").pop();
    const name = fileName.split(".").slice(0, -1).join(".");

    fileName = userData.studentNumber + "_"
      + auth().currentUser.displayName.replace(" ", "-") + "_"
      + Date.now() + "_"
      + appealUUID + "_"
      + "file" + type.toUpperCase() + "."
      + extension;


    let task;

    if (extension === "pdf") task = storage().ref("pdf/" + appealUUID + "/" + fileName).putFile(fileUri);
    else if (extension === "jpg" || extension === "jpeg" || extension === "png") task = storage().ref("images/" + appealUUID + "/" + fileName).putFile(fileUri);
    else task = storage().ref("documents/" + appealUUID + "/" + fileName).putFile(fileUri);


    try {
      await task;
      if (type === "x") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          percent: (percentCounter + 1) / 4 * 100,
          files: {
            fileX: fileName,
          },
        }, { merge: true }).then(() => {
          setPercentCounter(percentCounter + 1);
          setFileXisLoading(false);
          setFileX([{ name: fileName, uri: null }]);
          setIsUploadedFileX([{ name: fileName }]);
          setFileUploadedLoader(true);
          setTimeout(() => {
            setFileUploadedLoader(false);
          }, 2000);
        });
      else if (type === "y") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          percent: (percentCounter + 1) / 4 * 100,
          files: {
            fileY: fileName,
          },
        }, { merge: true }).then(() => {
          setPercentCounter(percentCounter + 1);
          setFileYisLoading(false);
          setFileY([{ name: fileName, uri: null }]);
          setIsUploadedFileY([{ name: fileName }]);
          setFileUploadedLoader(true);
          setTimeout(() => {
            setFileUploadedLoader(false);
          }, 2000);
        });
      else if (type === "z") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          percent: (percentCounter + 1) / 4 * 100,
          files: {
            fileZ: fileName,
          },
        }, { merge: true }).then(() => {
          setPercentCounter(percentCounter + 1);
          setFileZisLoading(false);
          setFileZ([{ name: fileName, uri: null }]);
          setIsUploadedFileZ([{ name: fileName }]);
          setFileUploadedLoader(true);
          setTimeout(() => {
            setFileUploadedLoader(false);
          }, 2000);
        });
      else if (type === "q") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          percent: ((percentCounter + 1) / 4 * 100),
          files: {
            fileQ: fileName,
          },
        }, { merge: true }).then(() => {
          setPercentCounter(percentCounter + 1);
          setFileQisLoading(false);
          setFileQ([{ name: fileName, uri: null }]);
          setIsUploadedFileQ([{ name: fileName }]);
          setFileUploadedLoader(true);
          setTimeout(() => {
            setFileUploadedLoader(false);
          }, 2000);
        });
    } catch (e) {
      console.log(e.message);
    }
  };

  const deleteFile = async (type, fileName) => {

    const extension = fileName.split(".").pop();
    let fileExtensionPath;
    if (extension === "pdf") fileExtensionPath = "pdf";
    else if (extension === "jpg" || extension === "jpeg" || extension === "png") fileExtensionPath = "images";
    else fileExtensionPath = "documents";

    try {
      console.log(fileExtensionPath + "/" + appealUUID + "/" + fileName);
      await storage().ref(fileExtensionPath + "/" + appealUUID + "/" + fileName).delete()
        .then(() => {
            if (type === "x") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  percent: (percentCounter - 1) / 4 * 100,
                  files: {
                    fileX: null,
                  },
                }, { merge: true }).then(() => {
                setPercentCounter(percentCounter - 1);
                setFileX([{ name: null, uri: null }]);
                setIsUploadedFileX([{ name: null }]);
              });
            } else if (type === "y") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  percent: (percentCounter - 1) / 4 * 100,
                  files: {
                    fileY: null,
                  },
                }, { merge: true }).then(() => {
                setPercentCounter(percentCounter - 1);
                setFileY([{ name: null, uri: null }]);
                setIsUploadedFileY([{ name: null }]);
              });
            } else if (type === "z") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  percent: (percentCounter - 1) / 4 * 100,
                  files: {
                    fileZ: null,
                  },
                }, { merge: true }).then(() => {
                setPercentCounter(percentCounter - 1);
                setFileZ([{ name: null, uri: null }]);
                setIsUploadedFileZ([{ name: null }]);
              });
            } else if (type === "q") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  percent: (percentCounter - 1) / 4 * 100,
                  files: {
                    fileQ: null,
                  },
                }, { merge: true }).then(() => {
                setPercentCounter(percentCounter - 1);
                setFileQ([{ name: null, uri: null }]);
                setIsUploadedFileQ([{ name: null }]);
              });
            }
          },
        );
    } catch (e) {
      console.log(e.message);
    } finally {
      if (type === "x") setFileX([{ name: null, uri: null }]);
      else if (type === "y") setFileY([{ name: null, uri: null }]);
      else if (type === "z") setFileZ([{ name: null, uri: null }]);
      else if (type === "q") setFileQ([{ name: null, uri: null }]);
    }
  };

  const finishAppeal = async () => {
    try {
      await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          isStart: 1,
          percent: 100,
        }, { merge: true });

      await firestore().collection("adminAppeals")
        .doc(appealUUID)
        .set({
          isStart: 1,
        }, { merge: true });
    } catch (e) {
      console.log(e.message);
    }
    navigation.navigate("Applications");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scv}>
        <Text>
          Kocaeli U??niversitesi Bas??ar??ya Dayal?? ve Merkezi Puan (Ek Madde-1) ile Kurum I??c??i ve Kurumlar Aras?? Yatay
          Gec??is?? Bas??vurular??na I??lis??kin Usul ve Esaslar
          (02.07.2018 tarihli senato toplant??s??nda kabul edilmis??tir.)
          Bu Usul ve Esaslar, Yu??kseko??g??retim Kurumlar??nda o??nlisans ve lisans du??zeyindeki programlar aras??nda
          gec??is??, c??ift anadal, yan dal ile kurumlar aras?? kredi transferi yap??lmas?? esaslar??na ilis??kin yo??netmelig??in
          7 nci maddesinin ikinci f??kras?? ve Ek Madde 1???e dayan??larak haz??rlanm??s??t??r.
          1-) Disiplin cezas?? alan o??g??renciler bas??ar??ya dayal?? yatay gec??is?? yapamazlar. Disiplin cezas?? almad??klar??n??
          bas??vuru s??ras??nda belgelemeleri s??artt??r. Merkezi puanla (EK Madde-1) yatay gec??is?? yapacak olan
          o??g??rencilerin disiplin cezas?? al??p almad??klar??na bak??lmaz.
          2-) Tamamen/k??smen yabanc?? dil ile eg??itim yapan veya o??g??retim dili Tu??rkc??e olan bo??lu??mden/ programdan,
          tamamen veya k??smen yabanc?? dil ile eg??itim yapan bo??lu??mlere/programlara bas??ar??ya dayal?? veya merkezi puanla
          (Ek Madde-1) kurum ic??i veya kurumlar aras?? yatay gec??is?? yapacak o??g??rencilerin bas??vuru s??ras??nda; geldig??i
          yu??kseko??g??retim kurumunda alm??s?? oldug??u zorunlu veya isteg??e bag??l?? yabanc?? dil haz??rl??k eg??itimini
          bas??arm??s?? olduklar??n?? belgelemeleri veya U??niversitemiz taraf??ndan yap??lacak olan yabanc?? dil yeterlik
          s??nav??n?? bas??armalar?? veya ulusal veya uluslararas?? gec??erlilig??i olan yabanc?? dil s??navlar??ndan as??ag????daki
          minimum puanlar?? alm??s?? olduklar??n?? belgelemeleri s??artt??r. Ancak, merkezi puanla (Ek Madde-1) haz??rl??k ve
          birinci s??n??fa yatay gec??is?? yapacak o??g??rencilerin, U??niversitemiz taraf??ndan yap??lacak olan yabanc?? dil
          yeterlik s??nav??n?? bas??aramamalar?? veya ulusal/uluslararas?? gec??erlilig??i olan yabanc?? dil s??navlar??ndan
          minimum puanlar?? alm??s?? olduklar??n?? belgeleyememeleri durumunda, yatay gec??is?? sonras??nda U??niversitemizde
          yabanc?? dil haz??rl??k eg??itimi almalar?? zorunludur.
          S??nav Ad??: KPDS,U??DS,YDS,YO??KDI??L TOEFL iBT
          PTE Akademik
          Minimum Puan: 50/100
          60/120 45/90
          3-) Tamamen veya k??smen yabanc?? dil ile eg??itim yapan bo??lu??mden/programdan, merkezi puanla (Ek Madde-1)
          tamamen veya k??smen yabanc?? dil ile eg??itim yapan bo??lu??me/programa yatay gec??is?? hakk?? kazanan, ancak
          geldig??i yu??kseko??g??retim kurumunda yabanc?? dil haz??rl??k eg??itiminde bir y??l bas??ar??s??z olmus?? o??g??renciler
          ic??in merkezi puanla (Ek Madde-1) yatay gec??is??ten sonra en fazla bir y??l yabanc?? dil haz??rl??k eg??itim hakk??
          daha verilir. Geldig??i yu??kseko??g??retim kurumunda yabanc?? dil haz??rl??k eg??itiminde iki y??l bas??ar??s??z olmus??
          o??g??rencilerin, bas??vurusu kabul edilmez.
          4-) Bas??ar??ya dayal?? kurum ic??i veya kurumlar aras?? yatay gec??is?? ic??in, o??g??rencinin kay??t dondurdug??u
          yar??y??l/yar??y??llar haric?? olmak u??zere, gec??is?? yapacag???? yar??y??la kadar ders plan??nda yer alan tu??m
          derslerini alm??s?? ve bas??arm??s?? olmas?? ile birlikte ag????rl??kl?? genel not ortalamas??n??n (AGNO) 100 u??zerinden
          en az 70 olmas?? s??artt??r. Bas??vuruda bulunan o??g??rencilerin bas??ar?? s??ralamas??;
          (Ag????rl??kl?? genel not ortalamas?? x 0,4) + (O??SYM yerles??tirme puan?? x 0,6)
          formu??lu??ne go??re yap??l??r. 4???lu??k ve 100???lu??k not do??nu??s??u??mu??nde YO??K not do??nu??s??u??m tablosu kullan??l??r.
          Yurtd??s???? yatay gec??is?? kontenjanlar??na bas??vuran o??g??rencilerin deg??erlendirilmesi sadece AGNO???ya go??re
          yap??l??r.
          5-) Bir yu??kseko??g??retim kurumuna yerles??tirilen o??nlisans o??g??rencileri yerles??tirildikleri programda bir
          yar??y??l, lisans o??g??rencileri bir y??l o??g??renim go??rdu??kten sonra, merkezi puanla (EK Madde-1) U??niversitemiz
          bo??lu??mlerine/programlar??na kurum ic??i veya kurumlar aras?? yatay gec??is?? bas??vurusu yapabilir. Geldig??i
          Yu??kseko??g??retim Kurumunda bir yar??y??l/y??l tamamlamam??s?? olan o??g??rencilerin bas??vurusu kabul edilmez.
          6-) Kurum ic??i veya kurumlar aras??, bas??ar??ya dayal?? veya Ek Madde-1 kapsam??ndaki tu??m yatay gec??is??
          tu??rlerinde, o??g??renci geldig??i Yu??kseko??g??retim Kurumu/Bo??lu??mu??/Program?????nda tamamlam??s?? oldug??u aktif
          do??nemin/y??l??n bir sonraki do??nemi/y??l?? ic??in ac????lm??s?? olan kontenjana bas??vurabilir. Kay??t hakk?? kazanan
          o??g??rencinin kayd?? ve ders plan?? atamas??, bas??vuru yapt??g???? do??nem/y??l ic??in yap??l??r. O??rneg??in; geldig??i
          Yu??kseko??g??retim Kurumunda ikinci s??n??f?? tamamlam??s?? bir lisans o??g??rencisi, u??c??u??ncu?? s??n??f kontenjan??na
          bas??vurabilir, kay??t hakk?? kazanmas?? halinde u??c??u??ncu?? s??n??fa kayd?? yap??l??r ve u??c??u??ncu?? s??n??f ders plan??na
          tabi olur.
          7-) Merkezi puan (Ek Madde 1) kapsam??nda yap??lan bas??vurular??n deg??erlendirilmesinde yap??lacak bas??ar??
          s??ralamas??;
          [(Aday??n O??SYM puan?? - Bo??lu??m O??SYM taban puan??) x 100] / Bo??lu??m O??SYM taban puan??
          formu??lu??ne go??re yap??l??r.
          8-) Bas??vuru deg??erlendirme sonuc??lar??na itiraz, sonuc??lar??n ilan??ndan sonraki ilk iki is?? gu??nu?? ic??erisinde
          mesai saatlerinde, ilgili bo??lu??m/program bas??kanl??klar??na yap??l??r.
          9-) 24 Nisan 2010 tarih ve 27561 say??l?? Resmi Gazete???de yay??mlanarak yu??ru??rlu??g??e giren ???Yu??kseko??g??retim
          Kurumlar??nda O??nlisans ve Lisans Du??zeyindeki Programlar Aras??nda Gec??is??, C??ift Anadal, Yan Dal I??le Kurumlar
          Aras?? Kredi Transferi Yap??lmas?? Esaslar??na I??lis??kin Yo??netmelik??? ten o??nce kullan??lmakta olan ???Kocaeli
          U??niversitesi O??nlisans ve Lisans O??g??retimi Yatay Gec??is?? Yo??nergesi??? yu??ru??rlu??kten kald??r??lm??s??t??r.
        </Text>
      </ScrollView>
      <View>
        <View style={styles.acceptTerms}>
          <Checkbox status={checked ? "checked" : "unchecked"}
                    onPress={() => {
                      setChecked(!checked);
                    }}

          />
          <Text>Okudum, anlad??m.</Text>
        </View>
        <View style={styles.content}>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <View key={0}>
              <TouchableOpacity
                style={{
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingLeft: 18,
                  paddingRight: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,.3)",
                  borderRadius: 6,
                }}
                onPress={() => docPicker("x")}
              >
                {fileX[0].name ? fileX.map(({ name, uri }) => {
                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                      <TouchableOpacity style={{ marginLeft: 18 }}
                                        onPress={() => deleteFile("x", name)}>
                        <Icon name="close" type="ionicon" />
                      </TouchableOpacity>
                      <Button style={{ marginLeft: 4 }} mode="contained" loading={fileXisLoading}
                              onPress={async () => {
                                setFileXisLoading(true);
                                await uploadFile("x");
                              }
                              }><Text
                        style={{ color: "#fff" }}>Y??kle</Text></Button>
                    </View>
                  );
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Ders
                  ????erikleri</Text>}
              </TouchableOpacity>
            </View>
            <View key={1}>
              <TouchableOpacity
                style={{
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingLeft: 18,
                  paddingRight: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,.3)",
                  borderRadius: 6,
                }}
                onPress={() => docPicker("y")}
              >
                {fileY[0].name ? fileY.map(({ name, uri }) => {
                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                      <TouchableOpacity style={{ marginLeft: 18 }}
                                        onPress={() => deleteFile("y", name)}>
                        <Icon name="close" type="ionicon" />
                      </TouchableOpacity>
                      <Button style={{ marginLeft: 4 }} mode="contained" loading={fileYisLoading}
                              onPress={async () => {
                                setFileYisLoading(true);
                                await uploadFile("y");
                              }}><Text
                        style={{ color: "#fff" }}>Y??kle</Text></Button>
                    </View>
                  );
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Ders Plan??
                  M??fredat??</Text>}
              </TouchableOpacity>
            </View>
            <View key={2}>
              <TouchableOpacity
                style={{
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingLeft: 18,
                  paddingRight: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,.3)",
                  borderRadius: 6,
                }}
                onPress={() => docPicker("z")}
              >
                {fileZ[0].name ? fileZ.map(({ name, uri }) => {
                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                      <TouchableOpacity style={{ marginLeft: 18 }}
                                        onPress={() => deleteFile("z", name)}>
                        <Icon name="close" type="ionicon" />
                      </TouchableOpacity>
                      <Button style={{ marginLeft: 4 }} mode="contained" loading={fileZisLoading}
                              onPress={async () => {
                                setFileZisLoading(true);
                                await uploadFile("z");
                              }}><Text
                        style={{ color: "#fff" }}>Y??kle</Text></Button>
                    </View>
                  );
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Transkript</Text>}
              </TouchableOpacity>
            </View>
            <View key={3}>
              <TouchableOpacity
                style={{
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingLeft: 18,
                  paddingRight: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,.3)",
                  borderRadius: 6,
                }}
                onPress={() => docPicker("q")}
              >
                {fileQ[0].name ? fileQ.map(({ name, uri }) => {
                    return (
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                        <TouchableOpacity style={{ marginLeft: 18 }}
                                          onPress={() => deleteFile("q", name)}>
                          <Icon name="close" type="ionicon" />
                        </TouchableOpacity>
                        <Button style={{ marginLeft: 4 }} mode="contained" loading={fileQisLoading}
                                onPress={async () => {
                                  setFileQisLoading(true);
                                  await uploadFile("q");
                                }}><Text
                          style={{ color: "#fff" }}>Y??kle</Text></Button>
                      </View>
                    );
                  }) :
                  <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>??SYM Sonu??
                    Belgesi</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.nextButtonContainer}>
        <Text style={{ color: "#28A745" }}>{fileUploadedLoader ? "Dosya y??klendi." : ""}</Text>
        <Button mode="contained" onPress={() => setIsDialogVisible(true)}
                disabled={!checked || !isUploadedFileX[0].name || !isUploadedFileY[0].name || !isUploadedFileZ[0].name || !isUploadedFileQ[0].name}>
          <Text style={{ color: "#fff" }}>BA??VURUYU TAMAMLA</Text>
        </Button>
      </View>
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>{"ba??vuruyu tamamla".toLocaleUpperCase()}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.acceptTerms}>
              <Checkbox status={lastAcceptTermsAndConditions ? "checked" : "unchecked"}
                        onPress={() => {
                          setLastAcceptTermsAndConditions(!lastAcceptTermsAndConditions);
                        }}

              />
              <Text>Evraklar?? do??ru doldurdu??umu ve bana ait oldu??unu onayl??yorum.</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Vazge??</Button>
            <Button onPress={() => finishAppeal()}
                    disabled={!lastAcceptTermsAndConditions}>Onayla</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    paddingHorizontal: 24,
  },
  acceptTerms: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  scv: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0, .2)",
    borderRadius: 4,
    padding: 8,
  },
  nextButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "space-between",
    justifyContent: "space-between",
    marginVertical: 12,
  },
});


export default HorizontalAppealScreen;
